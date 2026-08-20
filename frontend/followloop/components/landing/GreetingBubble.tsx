"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const MESSAGE = "Hi, I'm your FollowLoop assistant. Let's keep your leads moving.";

export default function GreetingBubble({ className }: { className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(MESSAGE.slice(0, i));
      if (i >= MESSAGE.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 24);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <div className="relative max-w-[260px] rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-3 shadow-elevated">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-600">
          <Sparkles size={12} />
          FollowLoop Assistant
        </div>
        <p className="text-[13px] leading-snug text-ink-soft">
          {displayed}
          {!done && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-blink bg-accent-500 align-middle" />}
        </p>
        <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-border bg-surface" />
      </div>
    </motion.div>
  );
}
