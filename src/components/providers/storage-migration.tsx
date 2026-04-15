"use client";

import { useEffect } from "react";
import { clearStaleStorage } from "@/lib/clear-stale-storage";

export function StorageMigration() {
  useEffect(() => {
    clearStaleStorage();
  }, []);

  return null;
}
