# FollowLoop.ai Monorepo

Welcome to the **FollowLoop.ai** monorepo repository.

## 📁 Workspace Architecture

```
FollowLoop/
├── backend/     # NestJS Backend (Auth, Contacts, Tasks, AI, Resend Email, Cron, Sentry)
└── frontend/    # React + TypeScript + Vite Frontend Application
```

## 🚀 Quick Start Guide

### Backend (`/backend`)
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```
- **API Base URL**: `http://localhost:3001/api/v1`
- **Swagger Docs**: `http://localhost:3001/api/docs`

### Frontend (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
- **Dev Server**: `http://localhost:5173`

---

## 🛠 Monorepo Convenience Commands

From the root directory:
- `npm run dev:backend` – Start NestJS backend in development mode
- `npm run dev:frontend` – Start Vite React frontend dev server
- `npm run build:backend` – Build NestJS production bundle
- `npm run build:frontend` – Build Vite React production bundle
- `npm run prisma:generate` – Generate Prisma Client types
