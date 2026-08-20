"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { heroAvatars } from "@/lib/data";
import Mascot from "./Mascot";
import GreetingBubble from "./GreetingBubble";
import HeroPreview from "./HeroPreview";

export default function Hero() {
  return (
    <section
      id="product"
      className="relative overflow-hidden pb-24 pt-40 sm:pt-48"
    >
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-grid-slate [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="container-page relative">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="section-eyebrow mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Now with AI reply detection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
            >
              Never let a lead
              <br />
              go <span className="text-gradient-accent">cold</span> again.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted"
            >
              FollowLoop.ai turns a scribbled note or a five-minute call into
              a polished, multi-step follow-up sequence — then tracks every
              open, reply, and booked call automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="/signup" className="btn-accent px-6 py-3.5 text-[15px] group">
                Start your free trial
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <a href="#copilot" className="btn-outline px-6 py-3.5 text-[15px] group">
                <PlayCircle size={16} className="text-accent-500" />
                Watch it build a sequence
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center gap-6 text-sm text-ink-muted"
            >
              <div className="flex -space-x-2.5">
                {heroAvatars.map((person) => (
                  <UserAvatar
                    key={person.name}
                    name={person.name}
                    src={person.src}
                    size="sm"
                    className="border-2 border-surface shadow-xs"
                  />
                ))}
              </div>
              <p>
                Trusted by <span className="font-semibold text-ink">2,400+</span> revenue teams
              </p>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative">
              <HeroPreview />
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: -40, y: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -left-16 -top-10 hidden w-24 sm:block lg:w-28"
              >
                <Mascot />
              </motion.div>
              <div className="absolute -left-8 top-24 hidden sm:block">
                <GreetingBubble />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
