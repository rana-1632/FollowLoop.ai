"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Mascot from "@/components/landing/Mascot";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

const highlights = [
  { icon: Sparkles, text: "AI drafts your sequences in seconds" },
  { icon: Zap, text: "Automatic reply detection and pausing" },
  { icon: ShieldCheck, text: "Enterprise-grade deliverability guardrails" },
];

export default function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "signup";
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden bg-ink px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-accent-glow opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-[0.05]" />

        {/* animated blobs */}
        <motion.div
          className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-cobalt-500/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <Link href="/" className="relative z-10">
          <Logo dark />
        </Link>

        <div className="relative z-10 max-w-sm">
          <div className="mb-8 h-28 w-28">
            <Mascot />
          </div>
          <h2 className="text-2xl font-bold leading-snug text-white">
            {mode === "login"
              ? "Welcome back. Your pipeline missed you."
              : "Set up your pipeline in under five minutes."}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Join thousands of revenue teams who let FollowLoop handle the
            follow-up so they can focus on the conversation.
          </p>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-sm text-white/75">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-accent-300">
                  <h.icon size={13} />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} FollowLoop.ai — All rights reserved.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
