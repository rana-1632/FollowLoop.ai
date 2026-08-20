"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function Mascot({ className }: { className?: string }) {
  const eyeLeftRef = useRef<SVGEllipseElement>(null);
  const eyeRightRef = useRef<SVGEllipseElement>(null);
  const armRef = useRef<SVGGElement>(null);
  const antennaRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Blink loop
      const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
      blinkTl
        .to([eyeLeftRef.current, eyeRightRef.current], {
          scaleY: 0.08,
          duration: 0.09,
          transformOrigin: "center",
          ease: "power1.in",
        })
        .to([eyeLeftRef.current, eyeRightRef.current], {
          scaleY: 1,
          duration: 0.12,
          ease: "power1.out",
        });

      // Friendly wave
      gsap.set(armRef.current, { transformOrigin: "20% 20%" });
      const waveTl = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 1 });
      waveTl
        .to(armRef.current, { rotate: -18, duration: 0.35, ease: "power2.out" })
        .to(armRef.current, { rotate: 6, duration: 0.28, ease: "power1.inOut" })
        .to(armRef.current, { rotate: -12, duration: 0.24, ease: "power1.inOut" })
        .to(armRef.current, { rotate: 0, duration: 0.3, ease: "power2.inOut" });

      // Antenna glow pulse
      gsap.to(antennaRef.current, {
        opacity: 0.4,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 240 260"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="FollowLoop AI assistant mascot"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F0FF" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20204A" />
            <stop offset="100%" stopColor="#14132C" />
          </linearGradient>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#5B5BF6" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Antenna */}
        <line x1="120" y1="34" x2="120" y2="10" stroke="#C3CAFF" strokeWidth="4" strokeLinecap="round" />
        <circle ref={antennaRef} cx="120" cy="10" r="7" fill="#5B5BF6" />

        {/* Left arm (waves) */}
        <g ref={armRef}>
          <rect x="36" y="128" width="14" height="52" rx="7" fill="#DCDFFF" />
          <circle cx="43" cy="124" r="10" fill="#C3CAFF" />
        </g>

        {/* Right arm */}
        <rect x="190" y="128" width="14" height="52" rx="7" fill="#DCDFFF" />
        <circle cx="197" cy="124" r="10" fill="#C3CAFF" />

        {/* Body */}
        <rect
          x="55"
          y="40"
          width="130"
          height="150"
          rx="38"
          fill="url(#bodyGrad)"
          stroke="#E0E4FF"
          strokeWidth="2"
          filter="url(#softShadow)"
        />

        {/* Screen face */}
        <rect x="75" y="66" width="90" height="66" rx="22" fill="url(#screenGrad)" />
        <ellipse ref={eyeLeftRef} cx="103" cy="99" rx="7" ry="9" fill="#8FE3C0" />
        <ellipse ref={eyeRightRef} cx="137" cy="99" rx="7" ry="9" fill="#8FE3C0" />
        <path d="M110 116 Q120 123 130 116" stroke="#8FE3C0" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Chest loop icon */}
        <g transform="translate(97,148)">
          <path d="M0 18V0H32" stroke="#5B5BF6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="18" r="5.5" fill="#5B5BF6" />
        </g>

        {/* Base / feet */}
        <rect x="80" y="196" width="26" height="16" rx="8" fill="#DCDFFF" />
        <rect x="134" y="196" width="26" height="16" rx="8" fill="#DCDFFF" />
      </svg>
    </motion.div>
  );
}
