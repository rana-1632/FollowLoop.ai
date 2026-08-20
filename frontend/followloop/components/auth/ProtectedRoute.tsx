"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !token) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
          <p className="text-xs text-ink-muted font-medium">Verifying authentication session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return null;
  }

  return <>{children}</>;
}
