"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import { useAuth } from "@/context/AuthContext";

export const HeaderWrapper = () => {
  const router = usePathname();
  const isMainPage = router == "/" || router.startsWith("/main");
  const isMemoPage = router.startsWith("/memo");
  const isToDoPage = router.startsWith("/todo");
  const isStatsPage = router.startsWith("/stats");
  const isFriendPage = router.startsWith("/friend");
  return (
    <header className="flex flex-col justify-center bg-white border-b border-gray-200 overflow-x-hidden sm:flex-row">
      <div className="w-full flex flex-col justify-between items-center px-4 py-3 sm:w-content sm:h-header sm:flex-row sm:px-8 sm:py-0">
        <Header
          isMainPage={isMainPage}
          isMemoPage={isMemoPage}
          isToDoPage={isToDoPage}
          isStatsPage={isStatsPage}
          isFriendPage={isFriendPage}
        />
        <HeaderNaverAuth />
      </div>
    </header>
  );
};

export const HeaderNaverAuth = () => {
  const { accessToken, logout } = useAuth()
  const router = useRouter()
  
  const handleSignIn = () => {
    router.push("http://localhost:8080/api/auth/naver")
  }
  const handleSignOut = async () => {
    await logout()
    router.push("/")
  }
  return (
    <div className="mt-3 sm:mt-0">
      {accessToken ? (
        <button
          className="font-nanumgothic_regular text-ui-sm text-gray-600 hover:text-primary transition-colors duration-150"
          onClick={handleSignOut}
        >
          로그아웃
        </button>
      ) : (
        <button
          className="font-nanumgothic_regular text-ui-sm text-gray-600 hover:text-primary transition-colors duration-150"
          onClick={handleSignIn}
        >
          로그인
        </button>
      )}
    </div>
  )
}
