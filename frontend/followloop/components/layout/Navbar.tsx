"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-expo ${
        scrolled ? "pt-3" : "pt-5"
      }`}
    >
      <div className="container-page">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 ease-out-expo ${
            scrolled
              ? "glass border border-border shadow-card"
              : "border border-transparent"
          }`}
        >
          <Link href="/" aria-label="FollowLoop.ai home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn-accent group">
              Start free trial
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <button
            aria-label="Toggle menu"
            className="rounded-full p-2 text-ink md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="container-page mt-2 md:hidden"
          >
            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-elevated">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-muted hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                <Link href="/login" className="btn-outline flex-1">
                  Log in
                </Link>
                <Link href="/signup" className="btn-accent flex-1">
                  Start free trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
