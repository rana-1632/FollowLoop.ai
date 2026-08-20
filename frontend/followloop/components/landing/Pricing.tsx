"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { pricingTiers } from "@/lib/data";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container-page">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="section-eyebrow">Pricing</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Simple pricing that scales with your pipeline.
          </h2>
          <p className="mt-4 text-ink-muted">
            14-day free trial on every plan. No credit card required.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-accent-300 bg-ink text-white shadow-elevated lg:-translate-y-3"
                  : "border-border bg-surface"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-1 text-[11px] font-semibold text-white shadow-glow">
                  Most popular
                </span>
              )}
              <h3 className={`text-sm font-semibold ${tier.highlighted ? "text-white/80" : "text-ink-muted"}`}>
                {tier.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                <span className={tier.highlighted ? "text-white/60" : "text-ink-muted"}>
                  {tier.period}
                </span>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${tier.highlighted ? "text-white/70" : "text-ink-muted"}`}>
                {tier.description}
              </p>

              <ul className="mt-7 flex-1 space-y-3.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${tier.highlighted ? "text-accent-300" : "text-accent-500"}`}
                    />
                    <span className={tier.highlighted ? "text-white/85" : "text-ink-soft"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-8 ${
                  tier.highlighted ? "btn-accent w-full" : "btn-outline w-full"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
