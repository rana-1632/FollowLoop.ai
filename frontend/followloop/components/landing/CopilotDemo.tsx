"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Mail, Clock, CheckCheck } from "lucide-react";

type ChatMsg = {
  role: "user" | "ai";
  text: string;
};

const script: ChatMsg[] = [
  { role: "user", text: "Notes: Diego from Solace Health, wants pricing + a demo next Tues. Budget conscious." },
  { role: "ai", text: "Got it. Building a 4-step sequence tuned for a budget-conscious healthcare buyer..." },
];

const generatedSteps = [
  { icon: Mail, label: "Day 0 — Send pricing overview + ROI one-pager" },
  { icon: Clock, label: "Day 2 — Follow-up if no open, soften the ask" },
  { icon: Mail, label: "Day 5 — Share case study from a similar clinic" },
  { icon: CheckCheck, label: "Day 7 — Propose Tuesday demo slots directly" },
];

export default function CopilotDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      setVisibleMsgs(1);
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      setThinking(true);
      await new Promise((r) => setTimeout(r, 1300));
      if (cancelled) return;
      setThinking(false);
      setVisibleMsgs(2);
      await new Promise((r) => setTimeout(r, 700));
      for (let i = 1; i <= generatedSteps.length; i++) {
        if (cancelled) return;
        setVisibleSteps(i);
        await new Promise((r) => setTimeout(r, 500));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <section id="copilot" className="py-24">
      <div className="container-page">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">AI copilot</span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Watch your notes turn into a running sequence.
            </h2>
            <p className="mt-4 max-w-md text-ink-muted">
              The copilot reads context the way a sharp SDR would — budget
              signals, urgency, tone — and drafts a sequence that sounds like
              you, not a template.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Understands intent from unstructured notes",
                "Matches tone: direct, consultative, or casual",
                "Suggests send-time windows per contact",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                    <Sparkles size={11} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div ref={ref} className="relative">
            <div className="rounded-3xl border border-border bg-surface p-2 shadow-elevated">
              <div className="rounded-[1.35rem] border border-border bg-surface-muted/50 p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-ink-soft">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                    <Sparkles size={13} />
                  </div>
                  FollowLoop Copilot
                </div>

                <div className="min-h-[168px] space-y-3">
                  <AnimatePresence>
                    {script.slice(0, visibleMsgs).map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-snug ${
                            msg.role === "user"
                              ? "rounded-br-md bg-ink text-white"
                              : "rounded-bl-md border border-border bg-surface text-ink-soft"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {thinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-xs text-ink-muted"
                    >
                      <Loader2 size={13} className="animate-spin text-accent-500" />
                      Drafting sequence…
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {visibleSteps > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 space-y-2 border-t border-border pt-4"
                    >
                      {generatedSteps.slice(0, visibleSteps).map((step, i) => (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2 text-[12px] text-ink-soft shadow-soft"
                        >
                          <step.icon size={13} className="shrink-0 text-accent-600" />
                          {step.label}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste call notes or type a lead update…"
                    className="flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-muted"
                  />
                  <button
                    aria-label="Send"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500 text-white transition-colors hover:bg-accent-600"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
