"use client";

import { motion } from "framer-motion";
import { Mail, CheckCircle2, Clock, MessageSquareText, Zap } from "lucide-react";

const steps = [
  { icon: Mail, label: "Intro email sent", meta: "Amara Chen · Northwind Labs", state: "done" as const },
  { icon: Clock, label: "Follow-up #2 scheduled", meta: "in 18 hours", state: "pending" as const },
  { icon: MessageSquareText, label: "Reply detected", meta: "Priya Nair replied \"Sounds great —\"", state: "active" as const },
];

export default function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      whileHover={{ rotate: 0, y: -4 }}
      className="relative w-full max-w-[480px] rounded-3xl border border-border bg-surface p-2 shadow-elevated"
    >
      <div className="rounded-[1.35rem] border border-border bg-surface-muted/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="pill bg-accent-50 text-accent-700 border border-accent-100 text-[10px]">
            <Zap size={10} /> Live sequence
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-ink">Cold Outreach — SaaS Founders</p>
            <p className="text-[11px] text-ink-muted">5 steps · 3 conditions · AI tone: Direct</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-ink">68%</p>
            <p className="text-[10px] text-ink-muted">reply rate</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  step.state === "done"
                    ? "bg-emerald-50 text-emerald-600"
                    : step.state === "active"
                    ? "bg-accent-50 text-accent-600"
                    : "bg-surface-muted text-ink-muted"
                }`}
              >
                {step.state === "done" ? <CheckCircle2 size={16} /> : <step.icon size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">{step.label}</p>
                <p className="truncate text-[11px] text-ink-muted">{step.meta}</p>
              </div>
              {step.state === "active" && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
