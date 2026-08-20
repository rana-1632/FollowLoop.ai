"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { LayoutProvider } from "@/lib/layout-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutProvider>{children}</LayoutProvider>
    </AuthProvider>
  );
}
