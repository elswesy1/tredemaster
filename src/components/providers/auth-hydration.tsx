"use client";

import { useState, useEffect } from "react";

interface AuthHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthHydration({ children, fallback }: AuthHydrationProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for all stores to hydrate
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">جاري تحميل البيانات...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
