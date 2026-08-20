"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Workflow,
  Inbox,
  BarChart3,
  ShieldCheck,
  Clock4,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI sequence generation",
    description:
      "Paste raw call notes or a few bullet points. FollowLoop drafts a complete, on-tone, multi-step sequence in seconds.",
    span: "lg:col-span-2",
  },
  {
    icon: Inbox,
    title: "Reply detection",
    description: "Automatically pauses sequences the moment a lead replies — no more awkward duplicate emails.",
    span: "",
  },
  {
    icon: Workflow,
    title: "Visual pipeline",
    description: "Drag contacts through a Kanban board that mirrors exactly where they sit in your follow-up journey.",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Delivery-grade analytics",
    description:
      "Every send, open, bounce and reply logged in real time, rolled up into charts your whole team actually reads.",
    span: "lg:col-span-2",
  },
  {
    icon: Clock4,
    title: "Smart send windows",
    description: "AI learns each contact's timezone and engagement pattern to pick the send time most likely to land.",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "Deliverability guardrails",
    description: "Built-in warm-up, throttling and domain health checks keep your sender reputation pristine.",
    span: "",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-24" id="features">
      <div className="container-page">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="section-eyebrow">Platform</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Everything a follow-up workflow needs — nothing it doesn&rsquo;t.
          </h2>
          <p className="mt-4 text-ink-muted">
            Built for the moment right after the intro call, when momentum
            matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated ${feature.span}`}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-glow opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-transform duration-300 group-hover:scale-110">
                <feature.icon size={20} />
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
