"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Mascot from "./Mascot";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-accent-glow opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />

          <div className="relative mx-auto mb-6 h-20 w-20 opacity-90">
            <Mascot />
          </div>

          <h2 className="relative mx-auto max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your next reply is one sequence away.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/60">
            Start free. Import your first 50 contacts and watch FollowLoop
            build your first sequence in minutes.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-accent px-6 py-3.5 text-[15px] group">
              Start your free trial
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link href="/login" className="btn px-6 py-3.5 text-[15px] text-white/80 hover:text-white">
              Already have an account? Log in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
