"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL에서 네이버가 던져준 code와 state 추출
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const requestedRef = useRef(false);

  useEffect(() => {
    if (!code || !state) {
      setError("인증 코드 또는 State가 URL에 존재하지 않습니다.");
      setLoading(false);
      return;
    }

    if (requestedRef.current) {
      return;
    }

    // code와 state가 주소창에 존재할 때만 백엔드로 POST 요청
    requestedRef.current = true;
    sendTokenToBackend(code, state);
  }, [code, state]);

  // 백엔드(8080)로 code와 state를 JSON Body에 담아 POST 요청을 보내는 함수
  const sendTokenToBackend = async (authCode: string, authState: string) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/naver/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code: authCode,
            state: authState,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("백엔드 서버로부터 토큰을 받아오는데 실패했습니다.");
      }

      const data = await response.json();

      setAccessToken(data.accessToken);
      router.push("/main");
    } catch (err: any) {
      setError(err.message || "로그인 처리 중 에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl font-mono text-sm">
      <h1 className="font-bold mb-2">OAuth Callback 처리기</h1>
      {loading && <p className="text-blue-500">🔄 인증 정보 송신 중...</p>}
      {error && <p className="text-red-500">❌ 에러: {error}</p>}
    </div>
  );
}
