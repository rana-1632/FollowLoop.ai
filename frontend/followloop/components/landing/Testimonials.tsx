"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import UserAvatar from "@/components/ui/UserAvatar";

export default function Testimonials() {
  return (
    <section id="customers" className="py-24">
      <div className="container-page">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="section-eyebrow">Customers</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Loved by teams who used to lose deals to silence.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 shadow-soft"
            >
              <div>
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="text-[15px] leading-relaxed text-ink-soft">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3">
                <UserAvatar name={t.name} src={(t as any).avatarUrl} size="md" />
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
