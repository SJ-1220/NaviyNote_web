"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
}

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: AuthUser | null;
  isLoggedIn: boolean;
  status: AuthStatus;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const handleSetAccessToken = (token: string | null) => {
    setAccessToken(token);
    setStatus(token ? "authenticated" : "unauthenticated");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/naver/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      handleSetAccessToken(null);
      setUser(null);
    }
  };

  const tryRefreshToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/token/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success && data.accessToken) {
        return data.accessToken;
      }
    } catch (error) {
      console.error("자동 로그인 갱신 실패:", error);
    }
    return null;
  };

  const handleAuthFetch = async (input: RequestInfo, init?: RequestInit) => {
    const doFetch = (token: string | null) =>
      fetch(input, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

    let response = await doFetch(accessToken);

    if (response.status === 401) {
      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = tryRefreshToken();
      }
      const newAccessToken = await refreshPromiseRef.current;
      refreshPromiseRef.current = null;

      if (newAccessToken) {
        handleSetAccessToken(newAccessToken);
        response = await doFetch(newAccessToken);
      } else {
        handleSetAccessToken(null);
        setUser(null);
      }
    }
    return response;
  };

  // refreshtoken 쿠키로 accesstoken 재발급 시도
  useEffect(() => {
    let cancelled = false;

    const tryRefresh = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/auth/token/refresh",
          {
            method: "POST",
            credentials: "include",
          },
        );
        const data = await res.json();
        if (!cancelled && res.ok && data.success && data.accessToken) {
          handleSetAccessToken(data.accessToken);
          return;
        }
      } catch (error) {
        console.error("자동 로그인 갱신 실패:", error);
      }
      if (!cancelled) setStatus("unauthenticated");
    };

    tryRefresh();

    return () => {
      cancelled = true;
    };
  }, []);

  // 사용자 정보(닉네임 등) 조회
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      return;
    }

    let cancelled = false;

    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
      }
    };

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken: handleSetAccessToken,
        user,
        isLoggedIn: !!accessToken,
        status,
        logout: handleLogout,
        authFetch: handleAuthFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth는 AuthProvider 안에서만 사용 가능합니다.");
  return context;
};
