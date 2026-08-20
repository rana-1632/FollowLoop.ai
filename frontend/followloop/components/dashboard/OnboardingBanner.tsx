"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, UserCheck, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface OnboardingBannerProps {
  onOpenProfile: () => void;
}

export default function OnboardingBanner({ onOpenProfile }: OnboardingBannerProps) {
  const { user, updateProfile } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If user is already onboarded and has company/avatar configured, or user dismissed banner
  if (dismissed || user?.isOnboarded) {
    return null;
  }

  const handleQuickComplete = () => {
    updateProfile({ isOnboarded: true });
    setDismissed(true);
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-accent-200/80 bg-gradient-to-r from-accent-500/10 via-surface to-accent-50/50 p-5 shadow-sm">
      <button
        onClick={handleQuickComplete}
        className="absolute right-3 top-3 text-ink-muted hover:text-ink transition-colors p-1"
        title="Dismiss onboarding banner"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-md shadow-accent-500/20">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                Welcome to FollowLoop.ai, {user?.name || "there"}! 🎉
              </h2>
              <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
                Setup 1/2
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-soft max-w-xl leading-relaxed">
              Complete your account profile to personalize automated outreach emails, AI sequences, and team signatures seamlessly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
          <button
            onClick={onOpenProfile}
            className="btn-accent py-2.5 px-4 text-xs flex items-center gap-2 shadow-sm"
          >
            <UserCheck size={15} /> Set Up Profile & Avatar <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
