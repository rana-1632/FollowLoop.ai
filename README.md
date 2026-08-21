# FollowLoop.ai 🚀
> **Autonomous AI-Powered Lead Nurturing & Multi-Step Follow-Up Automation Engine**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-e0234e?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Prisma-4169e1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06b6d4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

---

## 🌟 Overview & High-Impact Description

**FollowLoop.ai** is an enterprise-grade, high-performance SaaS platform built to solve one of sales teams' biggest challenges: **lead leakage due to inconsistent, manual follow-ups**. 

By harnessing the power of advanced Large Language Models (LLM) alongside robust background job scheduling, **FollowLoop.ai** converts raw meeting notes, call transcripts, or unformatted interaction logs into multi-step, context-aware follow-up sequences. It tracks lead engagement in real-time, auto-halts sequence dispatching upon receiving a reply, and guarantees high email deliverability through custom OAuth 2.0 / SMTP transport integrations.

---

## 📚 Live Interactive API Documentation

FollowLoop.ai provides fully typed OpenAPI / Swagger 3.0 interactive documentation for exploring, inspecting, and testing all REST API endpoints live:

👉 **[Explore Live Swagger API Documentation (https://followloopai-production.up.railway.app/api/docs)](https://followloopai-production.up.railway.app/api/docs)**

---

## 🎨 Application Screenshots

<div align="center">

![Application Showcase](./docs/1.png)

![Application Showcase](./docs/2.png)

![Application Showcase](./docs/3.png)

![Application Showcase](./docs/4.png)

![Application Showcase](./docs/5.png)

![Application Showcase](./docs/6.png)

![Sentry Error Monitoring Integration](./docs/7%20(Sentry).png)

![Resend Email Integration](./docs/8%20(Resend).png)

</div>

---

## ⚡ Key Features & System Architecture

- 🤖 **Smart AI Sequence Generator**: Utilizes Llama 3.3 70B via Groq API to parse unstructured lead notes, analyze buyer intent, and construct personalized follow-up sequences in seconds.
- 🎯 **Dual Nurture Modes**:
  - **Initial Outreach**: Cold & warm lead nurture sequence creation based on raw notes or transcripts.
  - **Post-Reply Continuation**: Smart follow-up adaptation triggered when an inbound customer reply is received.
- 📊 **Dynamic CRM Lead Tracking**: Dual-mode layout (Desktop Table & Mobile-First Card View) for monitoring lead status (`ACTIVE`, `REPLIED`, `COMPLETED`, `STOPPED`).
- ⏱️ **Precision Dispatch Engine**: Multi-step delay scheduler supporting hour and day delays with automated execution.
- 🔐 **OAuth 2.0 & Multi-Transport Email Service**: Built-in support for Google OAuth 2.0, Resend API, and custom SMTP credentials with AES-256-GCM token encryption.
- 🛑 **Automatic Inbound Reply Protection**: Real-time webhook listener auto-halts outgoing emails the moment a prospect responds, eliminating awkward robotic dispatches.
- 📱 **Gold-Standard Mobile Responsiveness**: Seamless UI scaling from mobile viewports (375px) up to ultra-wide displays (4K).

---

## 🛠️ Tech Stack & Infrastructure

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router) | React server & client components with dynamic routing |
| **Frontend Styling** | **Tailwind CSS** + **Framer Motion** | Premium dark-mode UI with fluid micro-animations |
| **Backend Framework** | **NestJS 10** | Enterprise Node.js framework with modular architecture |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** | Relational database with typed schema migrations |
| **AI / LLM Orchestration** | **Groq API** (Llama 3.3 70B) | High-speed inference engine for natural language drafting |
| **Email Transports** | **Nodemailer** + **Google OAuth2** + **Resend** | Multi-channel dispatching with fallback strategies |
| **Security & Encryption** | **AES-256-GCM** + **JWT** + **Passport.js** | Bank-grade token encryption & stateless session auth |
| **Diagnostics & Monitoring**| **Sentry** | End-to-end exception logging and performance tracking |
| **Deployment & Hosting** | **Vercel** (Frontend) + **Railway** (Backend) | CI/CD automated deployments with cloud PostgreSQL |

---

## 📁 Repository Structure

```
FollowLoop.ai/
├── backend/                     # Decoupled NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/              # Groq LLM integration & prompt engineering
│   │   │   ├── auth/            # JWT authentication & user profile management
│   │   │   ├── email/           # Email dispatch & OAuth transport service
│   │   │   ├── leads/           # CRM lead management & status tracking
│   │   │   ├── sequences/       # Multi-step sequence timeline engine
│   │   │   └── tasks/           # Scheduled background cron dispatcher
│   │   ├── common/              # Crypto utilities, Prisma DB service & guards
│   │   └── main.ts              # NestJS bootstrap entry point
│   ├── prisma/                  # Database schema & migrations
│   └── .env.example             # Backend environment template
│
├── frontend/followloop/         # Next.js 14 React Web Application
│   ├── app/                     # Next.js App Router pages
│   │   ├── automation-builder/  # AI sequence generator page
│   │   ├── sequences/           # Lead tracking dashboard page
│   │   └── settings/            # Connected email accounts & profile settings
│   ├── components/              # Modular UI components (Topbar, Sidebar, Modals)
│   ├── lib/                     # API client, state context & tailwind utilities
│   └── .env.example             # Frontend environment template
│
├── docs/                        # Application architecture screenshots & diagrams
├── .gitignore                   # Workspace root Git exclusion configuration
└── README.md                    # System documentation
```

---

## 🔑 Environment Variables Guide

### Backend Configuration (`backend/.env.example`)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/followloop_db?sslmode=require"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# AI Inference Engine (Groq / Llama 3)
GROQ_API_KEY="gsk_your_groq_api_key_here"
AI_MODEL="llama-3.3-70b-versatile"

# Resend / Email Dispatch
RESEND_API_KEY="re_123456789_your_resend_api_key"
EMAIL_FROM="FollowLoop.ai <notifications@resend.dev>"

# Encryption Key for Stored Credentials (32 Bytes / Hex)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"

# Application URLs
FRONTEND_URL="http://localhost:3000"
```

### Frontend Configuration (`frontend/followloop/.env.example`)

```env
# Backend API Base Endpoint
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# Frontend Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or `v10.x`
- **PostgreSQL**: Local instance or cloud database (Neon, Supabase, Railway)

### 1. Clone Repository
```bash
git clone https://github.com/rana-1632/FollowLoop.ai.git
cd FollowLoop.ai
```

### 2. Setup & Run Backend API
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template & populate keys
cp .env.example .env

# Run Database Migrations
npx prisma migrate dev --name init

# Start Backend Development Server
npm run start:dev
```
*The NestJS backend will start at `http://localhost:3001` with API routes prefixed at `/api/v1`.*

### 3. Setup & Run Frontend Application
```bash
# Open new terminal & navigate to frontend directory
cd frontend/followloop

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start Frontend Development Server
npm run dev
```
*The Next.js frontend web application will start at `http://localhost:3000`.*

---

## 🚀 Deployment Guide

### Backend Deployment (Railway)
1. Link your GitHub repository to **Railway**.
2. Set the root directory to `/backend`.
3. Configure environment variables (`DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, etc.) in the Railway dashboard.
4. Set Build Command: `npm run build`
5. Set Start Command: `npx prisma migrate deploy && npm run start:prod`

### Frontend Deployment (Vercel)
1. Import repository to **Vercel**.
2. Set the Root Directory to `frontend/followloop`.
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-production-url.railway.app/api/v1`.
4. Deploy! Vercel handles serverless rendering and static asset optimization automatically.

---

## 🔒 Security & Data Protection Architecture

FollowLoop.ai is engineered with defense-in-depth security principles to protect sensitive lead data and email credentials:

- **AES-256-GCM Credential Encryption**: Third-party SMTP passwords and OAuth 2.0 refresh tokens are encrypted at rest using Galois/Counter Mode (GCM) before database persistence.
- **Stateless JWT Authentication**: Secure user sessions are managed via signed JSON Web Tokens (JWT) with strict token expiration and header-based authentication guards.
- **CORS & Input Sanitization**: Backend endpoints are hardened with strict Cross-Origin Resource Sharing (CORS) policies and class-validator DTO sanitization pipes to protect against injection attacks.
- **Zero Secret Exposure**: Environment variables and private API credentials are dynamically loaded and strictly excluded from version control.

---

## 👨‍💻 Author & Contact Information

- **Name:** Mohsin Ali
- **Email:** [mohsinalirana222@gmail.com](mailto:mohsinalirana222@gmail.com)

---
<div align="center">
  <sub>Built with ❤️ for High-Stakes Competition Evaluation. © 2026 FollowLoop.ai. All rights reserved.</sub>
</div>
