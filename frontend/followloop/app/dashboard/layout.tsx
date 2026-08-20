import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your FollowLoop.ai command center — contacts, active sequences, and pipeline health at a glance.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
