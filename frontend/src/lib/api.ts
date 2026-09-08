import { useSyncExternalStore } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "profilsactifs_token";
const USER_KEY = "profilsactifs_user";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

const AUTH_CHANGE_EVENT = "profilsactifs:auth-change";

// Cache tied to the raw localStorage string so repeated calls (e.g. from
// useSyncExternalStore's getSnapshot) return a stable reference instead of a
// new object every time, which would otherwise trigger an infinite loop.
let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? JSON.parse(raw) : null;
  }
  return cachedUser;
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function subscribeToAuthChange(callback: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
}

// Reads the logged-in user via useSyncExternalStore rather than a plain
// getUser() call during render: getServerSnapshot always returns null, so
// the first client render matches the server-rendered output and React
// reconciles safely post-hydration instead of throwing a hydration-mismatch
// error when localStorage already holds a user on the client.
export function useCurrentUser(): AuthUser | null {
  return useSyncExternalStore(subscribeToAuthChange, getUser, () => null);
}

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// The backend re-mints a token by re-verifying the current one (same
// jwt.verify, same secret, no grace period) — so this only ever succeeds
// while the existing token is still valid. It's meant to be called
// proactively, well before the 24h expiry (see useTokenRefresh below), not
// reactively after a 401: by the time a request 401s, this token has
// already failed the exact same check and refreshing it would 401 too.
export async function refreshToken(): Promise<AuthResponse | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthResponse;
    setToken(data.token);
    setUser(data.user);
    return data;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 on an authenticated request (a token was sent, and it's not the
    // login endpoint itself rejecting bad credentials) means the session has
    // expired or the token is invalid — force a clean logout instead of
    // leaving the header showing a "connected" state that no longer works.
    if (res.status === 401 && token && path !== "/auth/login" && typeof window !== "undefined") {
      clearToken();
      clearUser();
      if (!window.location.pathname.startsWith("/login")) {
        // A hard navigation is intentional here: this is a plain module (not
        // a component), so useRouter() isn't available, and a full reload
        // cleanly resets any stale in-memory state left by the invalidated
        // session.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }

    throw new ApiError(res.status, data.error ?? "Une erreur est survenue");
  }

  return data as T;
}

// Best-effort: invalidates the session server-side, then always clears local
// state regardless of whether the request succeeded (an unreachable API
// shouldn't strand the user in a "logged in" UI they can't get out of).
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignored — local logout still proceeds below
    }
  }
  clearToken();
  clearUser();
}

// Locally-uploaded avatars come back as a relative /uploads/... path (needs
// the API origin prefixed); seeded/demo avatars are already absolute URLs.
export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) return undefined;
  return avatarUrl.startsWith("/") ? `${API_URL}${avatarUrl}` : avatarUrl;
}

// No Content-Type header here on purpose — the browser sets the
// multipart/form-data boundary itself, which JSON.stringify-based request()
// above doesn't support.
async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Une erreur est survenue");
  }
  return data as T;
}

export async function uploadAvatar(file: File): Promise<Profile> {
  const body = new FormData();
  body.append("avatar", file);
  return requestForm<Profile>("/profile/avatar", body);
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  role: "JOB_SEEKER" | "RECRUITER";
  dateOfBirth?: string;
  // JOB_SEEKER
  targetSector?: string;
  location?: string;
  skills?: string[];
  // RECRUITER
  companyName?: string;
  industry?: string;
  position?: string;
};

export type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    dateOfBirth: string | null;
    createdAt: string;
  };
};

export function register(payload: RegisterPayload) {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Video = {
  id: string;
  profileId: string;
  type: "LINK" | "UPLOAD";
  url: string;
  subtitleUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  consentDate: string | null;
  consentTextVersion: string | null;
  createdAt: string;
};

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  targetSector: string | null;
  location: string | null;
  avatarUrl: string | null;
  bio: string | null;
  companyName: string | null;
  industry: string | null;
  position: string | null;
  certificationScore: number | null;
  hasCertificationBadge: boolean;
  skills?: { id: string; name: string }[];
  videos?: Video[];
  createdAt: string;
  updatedAt: string;
};

export function getMyProfile() {
  return request<Profile>("/profile/me");
}

export function getProfileByUserId(userId: string) {
  return request<Profile>(`/profile/user/${userId}`);
}

export type UpdateProfilePayload = {
  fullName?: string;
  targetSector?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  companyName?: string;
  industry?: string;
  position?: string;
};

export function updateProfile(payload: UpdateProfilePayload) {
  return request<Profile>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createVideoLink(payload: { videoUrl: string; subtitleUrl?: string; consentTextVersion: string }) {
  const body = new FormData();
  body.append("type", "LINK");
  body.append("videoUrl", payload.videoUrl);
  if (payload.subtitleUrl) body.append("subtitleUrl", payload.subtitleUrl);
  body.append("consentTextVersion", payload.consentTextVersion);
  return requestForm<Video>("/profile/videos", body);
}

export function createVideoUpload(payload: { video: File; subtitle?: File; consentTextVersion: string }) {
  const body = new FormData();
  body.append("type", "UPLOAD");
  body.append("video", payload.video);
  if (payload.subtitle) body.append("subtitle", payload.subtitle);
  body.append("consentTextVersion", payload.consentTextVersion);
  return requestForm<Video>("/profile/videos", body);
}

export function deleteVideo(id: string) {
  return request<{ message: string; id: string }>(`/profile/videos/${id}`, { method: "DELETE" });
}

export type ModerationVideo = Video & {
  profile: { id: string; fullName: string; avatarUrl: string | null };
};

export type ModerationVideoPage = {
  videos: ModerationVideo[];
  total: number;
  page: number;
  pageSize: number;
};

export function getModerationVideoFeed(status: "PENDING" | "APPROVED" | "REJECTED", page = 1) {
  return request<ModerationVideoPage>(`/video/feed?status=${status}&page=${page}`);
}

export function moderateVideo(id: string, approved: boolean, reason?: string) {
  return request<Video>("/video/approval", {
    method: "PUT",
    body: JSON.stringify({ id, approved, reason }),
  });
}

export type InteractionType = "VIEW" | "CONTACT" | "FAVORITE" | "LIKE";

export function logInteraction(payload: { profileId: string; type: "VIEW" | "CONTACT"; videoId?: string; subject?: string; message?: string }): Promise<void>;
export function logInteraction(payload: { profileId: string; type: "FAVORITE" | "LIKE"; videoId?: string }): Promise<{ active: boolean }>;
export function logInteraction(payload: { profileId: string; type: InteractionType; videoId?: string; subject?: string; message?: string }) {
  return request<{ active: boolean } | void>("/interaction", { method: "POST", body: JSON.stringify(payload) });
}

export type Notification = {
  id: string;
  type: "VIEW" | "CONTACT";
  subject: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
  recruiter: { id: string; profile: { fullName: string; companyName: string | null } | null };
};

export function getNotifications() {
  return request<Notification[]>("/interaction/notifications");
}

export function markNotificationRead(id: string) {
  return request<Notification>(`/interaction/${id}/read`, { method: "PUT" });
}

export type SentContact = {
  id: string;
  subject: string | null;
  message: string | null;
  createdAt: string;
  profile: {
    userId: string;
    fullName: string;
    targetSector: string | null;
    certificationScore: number | null;
    hasCertificationBadge: boolean;
  };
};

export function getSentContacts() {
  return request<SentContact[]>("/interaction/sent");
}

export type RecruiterStats = { profilesViewed: number; favorites: number; messagesSent: number };
export type AdminInteractionStats = {
  interactionsThisMonth: number;
  profilesActive: number;
  certificationRate: number;
  videosPublished: number;
  videosPending: number;
  weeklySignups: { weekStart: string; count: number }[];
};

export function getInteractionStats() {
  return request<RecruiterStats | AdminInteractionStats>("/interaction/stats");
}

export type ModerationQueueUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: { fullName: string; avatarUrl: string | null } | null;
};

export type ModerationQueuePage = {
  users: ModerationQueueUser[];
  total: number;
  page: number;
  pageSize: number;
};

export function getModerationQueue(page = 1) {
  return request<ModerationQueuePage>(`/admin/moderation/queue?page=${page}`);
}

export function approveAccount(userId: string) {
  return request(`/admin/moderation/${userId}/approve`, { method: "PATCH" });
}

export function rejectAccount(userId: string) {
  return request(`/admin/moderation/${userId}/reject`, { method: "PATCH" });
}

export function suspendAccount(userId: string) {
  return request(`/admin/moderation/${userId}/suspend`, { method: "PATCH" });
}

// /video/play/:id (and /:id/subtitle) require an Authorization header, so a plain
// <video src="..."> can't hit them directly — fetch the bytes ourselves and
// hand the <video>/<track> element a local blob: URL instead.
export async function fetchMediaBlobUrl(path: string): Promise<string> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    let errorMsg = "Impossible de charger le média.";
    try {
      const data = await res.json();
      if (data && data.error) errorMsg = data.error;
    } catch (e) { }
    throw new ApiError(res.status, errorMsg);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Right to be forgotten: goes through /compliance/account (not /profile) —
// it also physically deletes uploaded video/subtitle files from disk, which
// a plain profile delete doesn't do.
export function deleteAccount() {
  return request<{ message: string }>("/compliance/account", { method: "DELETE" });
}

// Right of access: the full GDPR export of everything the platform holds
// about the current user (profile, videos, interactions, login history).
export function exportMyData() {
  return request<{ message: string; data: unknown }>("/compliance/data-export");
}

export type ProfilePage = {
  profiles: Profile[];
  total: number;
  page: number;
  pageSize: number;
};

// Server-side pagination is mandatory here (20/page, per Thomas Vignal's
// spec) — fetches one page at a time rather than accumulating every page
// into memory client-side.
export function getAllProfiles(page = 1) {
  return request<ProfilePage>(`/profile/all?page=${page}`);
}

export type QuestionOption = {
  id: string;
  questionId: string;
  text: string;
  points: number;
};

export type Question = {
  id: string;
  text: string;
  weighting: number;
  options: QuestionOption[];
};

export type QuestionnaireProgress = {
  id: string;
  profileId: string;
  questionnaireVersion: number;
  answers: Record<string, string>;
  lastSavedAt: string;
} | null;

export type QuestionnaireResult = {
  message: string;
  totalScore: number;
  hasCertificationBadge: boolean;
  completedAt: string;
};

export function getQuestionnaireQuestions() {
  return request<Question[]>("/questionnaire/questions");
}

export function getQuestionnaireProgress() {
  return request<QuestionnaireProgress>("/questionnaire/progression");
}

export function saveQuestionnaireProgress(answers: Record<string, string>) {
  return request<QuestionnaireProgress>("/questionnaire/progression", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function submitQuestionnaire(answers: Record<string, string>) {
  return request<QuestionnaireResult>("/questionnaire/submit", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials": "Adresse e-mail ou mot de passe incorrect.",
  "Email and password are required": "L'adresse e-mail et le mot de passe sont requis.",
  "Email, password and fullName are required": "L'adresse e-mail, le mot de passe et le nom complet sont requis.",
  "Unauthorized": "Vous devez être connecté pour accéder à cette page.",
  "Internal Server Error": "Une erreur inattendue est survenue côté serveur.",
};

export function translateApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_TRANSLATIONS[error.message] ?? error.message;
  }
  return "Impossible de se connecter pour le moment.";
}
