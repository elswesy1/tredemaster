"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [requireAuth, status, router]);

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useAdmin() {
  const { user, isLoading, isAuthenticated } = useAuth(true);

  return {
    isAdmin: user?.role === "admin",
    user,
    isLoading,
    isAuthenticated,
  };
}
