"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const colorPalettes = [
  "from-indigo-500 to-purple-600 text-white",
  "from-blue-500 to-cyan-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-purple-600 to-indigo-700 text-white",
];

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs font-bold",
  lg: "h-12 w-12 text-sm font-bold",
  xl: "h-16 w-16 text-base font-bold",
};

export default function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const cleanName = (name || "User").trim();
  const parts = cleanName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase();

  // Deterministic color palette index derived from name hash
  let charCodeSum = 0;
  for (let i = 0; i < cleanName.length; i++) {
    charCodeSum += cleanName.charCodeAt(i);
  }
  const colorClass = colorPalettes[charCodeSum % colorPalettes.length];

  const hasValidCustomImage =
    src &&
    typeof src === "string" &&
    src.trim() !== "" &&
    !src.includes("pravatar.cc") &&
    !src.includes("placeholder");

  if (hasValidCustomImage) {
    return (
      <img
        src={src!}
        alt={cleanName}
        className={cn(
          "rounded-full object-cover border border-border shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold uppercase tracking-wider border border-white/20 shadow-xs",
        colorClass,
        sizeClasses[size],
        className
      )}
      title={cleanName}
    >
      {initials}
    </div>
  );
}
