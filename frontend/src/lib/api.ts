import { useSyncExternalStore } from "react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
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

export function subscribeToAuthChange(callback: () => void) {
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

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
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
  hasWorkPermit: boolean;
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

// /media/:id (and /:id/subtitle) require an Authorization header, so a plain
// <video src="..."> can't hit them directly — fetch the bytes ourselves and
// hand the <video>/<track> element a local blob: URL instead.
export async function fetchMediaBlobUrl(path: string): Promise<string> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new ApiError(res.status, "Impossible de charger le média.");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function deleteAccount() {
  return request<Profile>("/profile", { method: "DELETE" });
}

export function getAllProfiles() {
  return request<Profile[]>("/profile/all");
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
  hasWorkPermit: boolean;
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
