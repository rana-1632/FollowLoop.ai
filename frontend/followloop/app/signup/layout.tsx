import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Your Free Trial",
  description: "Create your FollowLoop.ai account and start automating your follow-up in minutes. 14-day free trial, no credit card required.",
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
