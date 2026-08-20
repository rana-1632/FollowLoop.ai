# FollowLoop.ai - Autonomous CRM & Follow-Up SaaS

> **AI-Powered Autonomous CRM & Follow-Up SaaS Built Entirely on Free Tiers**

---

## 🌟 Architecture Overview

FollowLoop.ai helps freelancers, job seekers, and sales teams turn lost leads into closed deals by automating follow-up tracking, AI email draft generation (`gpt-4o-mini`), and email dispatching (`Resend`).

- **Architecture Blueprint**: See [`brain.md`](./brain.md) for full system specifications.
- **Backend Framework**: NestJS (TypeScript)
- **Database & ORM**: PostgreSQL (Neon / Supabase) + Prisma ORM
- **AI Engine**: OpenAI API (`gpt-4o-mini`)
- **Email Service**: Resend API
- **Monitoring**: Sentry.io
- **API Docs**: Swagger UI (`/api/docs`)

---

## 🚀 Getting Started

### 1. Requirements & Setup
- Node.js (v18+)
- PostgreSQL Database URL (Neon or Supabase free tier)

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Prisma Generation
```bash
npm run prisma:generate
# To apply migrations to your live PostgreSQL instance:
# npm run prisma:migrate
```

### 4. Running the Application
```bash
# Development Mode
npm run start:dev

# Production Build & Run
npm run build
npm run start:prod
```

### 5. Interactive API Documentation
Once running, navigate to:
- **Swagger Documentation UI**: `http://localhost:3001/api/docs`
- **Base API Endpoint**: `http://localhost:3001/api/v1`

---

## 🔑 Environment Variables

Check `.env.example` for required environment configuration key-values.
