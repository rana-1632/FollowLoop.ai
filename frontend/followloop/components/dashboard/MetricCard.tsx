import React, { memo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
  index?: number;
}

function MetricCard({ label, value, delta, trend, icon: Icon, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="card group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
          <Icon size={18} />
        </div>
        <span
          className={cn(
            "pill text-[11px] font-semibold",
            trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}
        >
          {trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </motion.div>
  );
}

export default memo(MetricCard);
