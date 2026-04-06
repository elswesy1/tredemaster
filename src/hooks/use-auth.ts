"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Extend the session user type
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User & {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

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
