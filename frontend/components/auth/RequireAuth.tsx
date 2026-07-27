"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, mustChangePassword } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [isAuthenticated, isLoading, mustChangePassword, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-slate-600">
        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-brand-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (mustChangePassword && pathname !== "/change-password") {
    return null;
  }

  return <>{children}</>;
}
