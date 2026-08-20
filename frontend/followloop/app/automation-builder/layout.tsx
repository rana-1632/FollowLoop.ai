import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Sequence Builder",
  description: "Turn raw notes into a multi-step AI-generated follow-up sequence with FollowLoop.ai's automation builder.",
  robots: { index: false, follow: false },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
