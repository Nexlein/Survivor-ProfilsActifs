const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "profilsactifs_token";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

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
    throw new ApiError(res.status, data.error ?? "Une erreur est survenue");
  }

  return data as T;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials": "Adresse e-mail ou mot de passe incorrect.",
  "Email and password are required": "L'adresse e-mail et le mot de passe sont requis.",
  "Unauthorized": "Vous devez être connecté pour accéder à cette page.",
};

export function translateApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_TRANSLATIONS[error.message] ?? error.message;
  }
  return "Impossible de se connecter pour le moment.";
}
