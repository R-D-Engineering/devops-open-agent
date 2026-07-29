"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  clearAuthToken,
  loadAuthToken,
  persistAuthToken,
} from "@/services/authApi";
import { setAuthToken } from "@/services/api";
import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  SignUpRequest,
} from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (request: LoginRequest) => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function postAuthPath(user: AuthUser): string {
  return user.must_change_password ? "/change-password" : "/";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = loadAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setAuthToken(token);
    let cancelled = false;
    authApi
      .getMe()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch((error: unknown) => {
        // Only wipe the session on real auth failures. Network blips
        // should not force a logout on refresh.
        const status =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 401 || status === 403) {
          clearAuthToken();
          setAuthToken(null);
          if (!cancelled) {
            setUser(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = useCallback((token: string, currentUser: AuthUser) => {
    persistAuthToken(token);
    setUser(currentUser);
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await authApi.login(request);
      applyAuth(response.access_token, response.user);
      router.push(postAuthPath(response.user));
    },
    [applyAuth, router],
  );

  const signUp = useCallback(
    async (request: SignUpRequest) => {
      const response = await authApi.signUp(request);
      applyAuth(response.access_token, response.user);
      router.push(postAuthPath(response.user));
    },
    [applyAuth, router],
  );

  const changePassword = useCallback(
    async (request: ChangePasswordRequest) => {
      const updated = await authApi.changePassword(request);
      setUser(updated);
      router.push("/");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setAuthToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      mustChangePassword: Boolean(user?.must_change_password),
      login,
      signUp,
      changePassword,
      logout,
    }),
    [user, isLoading, login, signUp, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
