import { cn } from "@/lib/utils";

export default function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="16" fill={dark ? "#FFFFFF" : "#191A23"} />
        <path
          d="M20 44V20H44"
          stroke="#5B5BF6"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="44" r="5" fill="#5B5BF6" />
        <path d="M20 32H34" stroke={dark ? "#191A23" : "#F5F5F4"} strokeWidth="5" strokeLinecap="round" />
      </svg>
      <span className={cn("text-[17px] font-bold tracking-tight", dark ? "text-white" : "text-ink")}>
        FollowLoop<span className="text-accent-500">.ai</span>
      </span>
    </div>
  );
}
