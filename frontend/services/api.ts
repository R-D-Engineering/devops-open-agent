import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const AUTH_TOKEN_STORAGE_KEY = "kda_auth_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

function readStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function isAppAuthFailure(error: {
  response?: {
    status?: number;
    headers?: Record<string, string>;
    data?: { detail?: unknown };
  };
}): boolean {
  if (error.response?.status !== 401) {
    return false;
  }

  const wwwAuth = error.response.headers?.["www-authenticate"];
  if (typeof wwwAuth === "string" && wwwAuth.toLowerCase().includes("bearer")) {
    return true;
  }

  const detail = error.response.data?.detail;
  if (typeof detail === "string") {
    const normalized = detail.toLowerCase();
    return (
      normalized.includes("authentication required") ||
      normalized.includes("invalid or expired token") ||
      normalized.includes("user not found")
    );
  }

  return false;
}

// Always attach the latest token from localStorage so refreshes / races
// cannot send authenticated API calls without Authorization.
apiClient.interceptors.request.use((config) => {
  const token = readStoredAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAppAuthFailure(error) && typeof window !== "undefined") {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/change-password");
      // Only force logout for true auth failures when a token was present.
      const hadToken = Boolean(readStoredAuthToken());
      if (hadToken && !isAuthPage) {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        delete apiClient.defaults.headers.common.Authorization;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
