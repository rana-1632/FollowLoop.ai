import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Neutral off-white / slate base
        canvas: "#FAFAF9",
        surface: "#FFFFFF",
        "surface-muted": "#F5F5F4",
        border: {
          DEFAULT: "#E7E5E4",
          strong: "#D6D3D1",
        },
        ink: {
          DEFAULT: "#191A23",
          soft: "#44434F",
          muted: "#787680",
        },
        // Sophisticated accent — electric indigo / cobalt
        accent: {
          50: "#EEF1FF",
          100: "#E0E4FF",
          200: "#C3CAFF",
          300: "#9FA8FF",
          400: "#7C7FFF",
          500: "#5B5BF6",
          600: "#4640E0",
          700: "#3730B8",
          800: "#2C2A93",
          900: "#252373",
        },
        cobalt: {
          400: "#3FA6FF",
          500: "#1E8CFF",
          600: "#0A6FE0",
        },
        success: "#12B76A",
        warning: "#F79009",
        danger: "#F04438",
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(to right, rgba(15,15,20,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,15,20,0.045) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(60% 60% at 50% 0%, rgba(91,91,246,0.14) 0%, rgba(250,250,249,0) 70%)",
        "accent-glow":
          "radial-gradient(circle at 30% 20%, rgba(91,91,246,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(30,140,255,0.25), transparent 45%)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,20,25,0.04), 0 1px 1px rgba(20,20,25,0.03)",
        card: "0 1px 3px rgba(20,20,25,0.06), 0 8px 24px -12px rgba(20,20,25,0.10)",
        elevated: "0 4px 12px rgba(20,20,25,0.06), 0 24px 48px -16px rgba(20,20,25,0.18)",
        glow: "0 0 0 1px rgba(91,91,246,0.15), 0 8px 30px -8px rgba(91,91,246,0.45)",
        "inner-border": "inset 0 0 0 1px rgba(20,20,25,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 28s linear infinite",
        blink: "blink 1s step-end infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        organic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
