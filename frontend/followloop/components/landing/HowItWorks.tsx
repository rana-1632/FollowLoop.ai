"use client";

import { motion } from "framer-motion";
import { NotebookPen, Sparkles, Send } from "lucide-react";

const steps = [
  {
    icon: NotebookPen,
    title: "Drop in your notes",
    description:
      "Paste raw call notes, a transcript, or a few bullet points about the lead — no formatting required.",
  },
  {
    icon: Sparkles,
    title: "AI builds the sequence",
    description:
      "FollowLoop drafts a multi-step, on-tone email sequence with smart timing and conditional branches.",
  },
  {
    icon: Send,
    title: "Sit back and track replies",
    description:
      "Sends go out automatically, pause on reply, and every touch is logged straight into your pipeline.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="container-page">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-eyebrow">How it works</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            From messy notes to a running sequence in under a minute.
          </h2>
        </div>

        <div className="relative grid gap-10 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center md:text-left"
            >
              <div className="relative z-10 mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-surface shadow-card md:mx-0">
                <step.icon size={26} className="text-accent-600" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
