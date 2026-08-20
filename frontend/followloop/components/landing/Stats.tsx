"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

const stats = [
  { value: 2400, suffix: "+", label: "Revenue teams onboard" },
  { value: 4.8, suffix: "M", label: "Follow-ups sent this year", isMillion: true },
  { value: 63, suffix: "%", label: "Avg. reply rate increase" },
  { value: 11, suffix: "hrs", label: "Saved per rep, per week" },
];

function Counter({ value, suffix, isMillion }: { value: number; suffix: string; isMillion?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setDisplay(isMillion ? v.toFixed(1) : Math.round(v).toString());
      },
    });
    return () => controls.stop();
  }, [inView, value, isMillion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-center sm:text-left"
            >
              <p className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} isMillion={stat.isMillion} />
              </p>
              <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
