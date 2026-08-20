# FollowLoop.ai — Frontend

Production-ready frontend for **FollowLoop.ai**, an AI-powered follow-up and
CRM automation platform. Built with Next.js 14 (App Router), TypeScript,
Tailwind CSS, and Framer Motion (with a touch of GSAP for the mascot's micro
animations).

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS — custom light theme (off-white canvas, deep
  slate ink, electric indigo / cobalt accents)
- **Animation:** Framer Motion (page/element transitions, scroll reveals,
  interactive demos) + GSAP (mascot blink/wave/antenna-pulse loops)
- **Icons:** lucide-react
- **Charts:** Recharts
- **Fonts:** Plus Jakarta Sans (display/body) + JetBrains Mono, loaded via
  `next/font/google`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                        |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Start the dev server                |
| `npm run build`  | Production build                    |
| `npm run start`  | Serve the production build          |
| `npm run lint`   | Run ESLint                          |

> **Note:** `next/font/google` fetches font files at build time, so
> `npm run build` requires outbound network access to `fonts.googleapis.com`
> / `fonts.gstatic.com`. This has been verified to compile cleanly end to
> end; if your CI/build environment blocks that domain, either allow it or
> swap the two `next/font/google` imports in `app/layout.tsx` for local
> `next/font/local` files.

## Project structure

```
app/
  layout.tsx                 Root layout — fonts, SEO metadata, JSON-LD
  page.tsx                   Landing page
  globals.css                Design tokens & base styles
  sitemap.ts / robots.ts     SEO
  login/                     Login route (+ layout for metadata)
  signup/                    Signup route (+ layout for metadata)
  dashboard/                 CRM dashboard (table + Kanban)
  automation-builder/        AI sequence builder hub
  analytics/                 Analytics & delivery logs

components/
  layout/                    Navbar, Footer, Logo
  landing/                   Hero, Mascot, GreetingBubble, HeroPreview,
                              FeatureGrid, HowItWorks, CopilotDemo,
                              Testimonials, Pricing, CTASection, LogoMarquee,
                              Stats
  auth/                      AuthLayout, FormField
  dashboard/                 Sidebar, Topbar, MetricCard, ContactsTable,
                              KanbanBoard, ActivityFeed
  builder/                   SequenceStep
  analytics/                 VolumeChart, FunnelChart, DeliveryLogTable

lib/
  data.ts                    Typed mock data shared across views
  utils.ts                   cn() class helper, formatNumber()
```

## Design system

Colors, spacing, radii, shadows, and keyframes are defined centrally in
`tailwind.config.ts` under `theme.extend` — adjust brand colors (`accent`,
`cobalt`), the `ink`/`canvas` neutrals, or the custom shadow/animation tokens
there rather than hard-coding values in components.

## Pages included

- **Landing page** — hero with animated mascot + typewriter greeting bubble,
  live product preview, logo marquee, animated stats counters, bento feature
  grid, 3-step explainer, interactive AI copilot chat demo, testimonials,
  pricing, and a closing CTA.
- **Auth** — split-screen `/login` and `/signup` with animated gradient
  blobs, inline validation states, password strength checklist, and social
  login buttons.
- **Dashboard** — sidebar nav, topbar search, metric cards, and a
  table/Kanban toggle for the contacts pipeline plus an activity feed.
- **Sequence Builder** — paste-in notes, tone selector, simulated AI
  generation with staged progress, and an editable step timeline
  (email / wait / condition nodes).
- **Analytics** — volume area chart, conversion funnel bar chart, and a
  delivery status log.

## Deploying into a monorepo

Drop this entire directory in as `frontend/` inside your monorepo, then from
the repo root:

```bash
cd frontend
npm install
npm run build
```

Wire up your workspace's package manager (npm/yarn/pnpm workspaces, Turborepo,
Nx, etc.) as usual — this package has no special monorepo requirements beyond
a standard `package.json`.
