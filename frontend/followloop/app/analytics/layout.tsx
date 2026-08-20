import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track delivery, open, reply, and booking rates across every FollowLoop.ai sequence.",
  robots: { index: false, follow: false },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
