# FollowLoop.ai - Autonomous CRM & Follow-Up SaaS Architecture Reference (brain.md)

## 1. Executive Summary & Product Vision

**FollowLoop.ai** is an AI-powered Autonomous CRM & Intelligent Follow-Up Engine designed to eliminate cold lead drop-off and lost opportunities. The system automatically tracks relationships, schedules contextual follow-up reminders, crafts personalized AI email drafts using LLMs (`gpt-4o-mini`), and triggers single-click or automated email dispatching.

### Target Audience & Core Use Cases
1. **Freelancers & Consultants**: Track leads, proposal sent dates, pitch status, and client check-ins without manually maintaining spreadsheets.
2. **Job Seekers & Networkers**: Manage application statuses, interview follow-ups, post-interview thank-you notes, and recruiter relationships.
3. **B2B Sales Executives & Agencies**: Maintain high-volume pipeline touchpoints, log interactions, auto-generate contextual follow-up messaging, and automate recurring email sequences.

---

## 2. Tech Stack & Free-Tier Architectural Constraints

All components are strictly architected around **100% Free Tier Services**:

| Component | Technology | Free Tier Limit / Specifications |
| :--- | :--- | :--- |
| **Backend Framework** | **NestJS** (TypeScript) | Modular, enterprise-grade architecture with Dependency Injection |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** | Hosted on **Neon.tech** or **Supabase** (500MB free DB storage, connection pooling) |
| **AI Generation** | **OpenAI API** | `gpt-4o-mini` / `gpt-3.5-turbo` (Ultra-low cost / Pay-as-you-go free credits) |
| **Email Delivery** | **Resend API** | Free Tier: 3,000 emails/month, 100 emails/day, official Node SDK |
| **Monitoring & Crash Reporting** | **Sentry.io** | Free Developer Tier (5,000 errors/month, performance tracing) |
| **API Documentation** | **Swagger** (`@nestjs/swagger`) | OpenAPI 3.0 auto-generated interactive documentation |
| **Frontend (Demo)** | **Next.js 14 / HTML5 + Tailwind** | Light-weight dashboard consuming backend REST endpoints |

---

## 3. Database Schema (Prisma Data Model)

Below is the complete, production-ready `schema.prisma` mapping `User`, `Contact`, `FollowUpTask`, and `EmailLog` models with indexes, cascades, and enums.

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum Channel {
  EMAIL
  LINKEDIN
  WHATSAPP
}

enum TaskStatus {
  PENDING
  SENT
  CANCELLED
}

enum EmailStatus {
  SENT
  FAILED
}

model User {
  id           String         @id @default(uuid())
  email        String         @unique
  passwordHash String
  fullName     String?
  companyName  String?
  role         Role           @default(USER)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  contacts     Contact[]
  tasks        FollowUpTask[]
  emailLogs    EmailLog[]

  @@map("users")
}

model Contact {
  id                  String         @id @default(uuid())
  userId              String
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name                String
  company             String?
  channel             Channel        @default(EMAIL)
  lastInteractionDate DateTime?
  currentStage        String         @default("LEAD")
  
  email               String?
  phone               String?
  position            String?
  notes               String?

  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  tasks               FollowUpTask[]
  emailLogs           EmailLog[]

  @@index([userId])
  @@index([channel])
  @@map("contacts")
}

model FollowUpTask {
  id                 String     @id @default(uuid())
  contactId          String
  contact            Contact    @relation(fields: [contactId], references: [id], onDelete: Cascade)

  userId             String?
  user               User?      @relation(fields: [userId], references: [id], onDelete: Cascade)

  title              String?
  suggestedDate      DateTime
  aiGeneratedContent String?
  subjectLine        String?
  
  status             TaskStatus @default(PENDING)
  retryCount         Int        @default(0)

  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  emailLogs          EmailLog[]

  @@index([contactId])
  @@index([suggestedDate, status])
  @@map("follow_up_tasks")
}

model EmailLog {
  id           String       @id @default(uuid())
  userId       String
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  contactId    String?
  contact      Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)

  taskId       String?
  task         FollowUpTask? @relation(fields: [taskId], references: [id], onDelete: SetNull)

  recipient    String
  subject      String
  bodyContent  String?
  status       EmailStatus  @default(SENT)
  errorMessage String?
  createdAt    DateTime     @default(now())

  @@index([userId])
  @@index([contactId])
  @@map("email_logs")
}
```

---

## 4. API Endpoints Specification

### 4.1 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Create a new user account.
- `POST /api/v1/auth/login` — Authenticate and return JWT token.
- `GET /api/v1/auth/me` — Fetch current user profile.

### 4.2 Contacts & Deals (`/api/v1/contacts`)
- `POST /api/v1/contacts` — Create a new contact lead.
- `GET /api/v1/contacts` — List user contacts (with pagination, search, status filters).
- `GET /api/v1/contacts/:id` — Retrieve contact details with interaction history.
- `PATCH /api/v1/contacts/:id` — Update contact information or pipeline status.
- `DELETE /api/v1/contacts/:id` — Delete a contact.

### 4.3 Follow-Up Tasks (`/api/v1/tasks`)
- `POST /api/v1/tasks` — Schedule a new follow-up task manually.
- `GET /api/v1/tasks` — List user tasks (filter by overdue, upcoming, status).
- `GET /api/v1/tasks/:id` — Task detail view.
- `PATCH /api/v1/tasks/:id` — Update task status or due date.
- `DELETE /api/v1/tasks/:id` — Delete task.

### 4.4 AI Email Generation (`/api/v1/ai`)
- `POST /api/v1/ai/generate-email` — Generate context-aware follow-up email subject & draft using OpenAI (`gpt-4o-mini`).
- `POST /api/v1/ai/tasks/:taskId/generate` — Generate and save draft directly onto an existing `FollowUpTask`.

### 4.5 Dispatch & Email Logs (`/api/v1/emails`)
- `POST /api/v1/emails/send` — Send email via Resend API (takes `contactId`, `subject`, `body`, optional `taskId`).
- `GET /api/v1/emails/logs` — List sent email history and statuses.

### 4.6 Cron & System Triggers (`/api/v1/cron`)
- `POST /api/v1/cron/process-overdue-followups` — Autonomous runner checking pending tasks due today, generating AI drafts, and queuing notifications.

---

## 5. Architectural Principles & Operational Rules

1. **Strict Free-Tier Budgeting**: Zero reliance on paid third-party infrastructure. Keep memory footprint low, optimize Prisma queries, leverage Resend 3K/mo quota safely.
2. **Production-Grade TypeScript**: `strict: true` in `tsconfig.json`, explicit DTO validation with `class-validator` and `class-transformer`.
3. **Global Error Handling & Sentry Monitoring**: All unexpected runtime exceptions captured via custom `@Catch()` Sentry Filter with sanitized response payloads.
4. **Interactive Swagger Documentation**: Standardized `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, and `@ApiBearerAuth()` decorators across all controllers.
5. **Security First**: JWT-based stateless authentication, `bcrypt` password hashing, CORS protection, helmet HTTP security headers, and input sanitization.

---

## 6. Project Directory Layout

```
Final_Project/
├── brain.md
├── .env.example
├── README.md
├── nest-cli.json
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── common/
    │   ├── decorators/
    │   ├── filters/
    │   │   └── sentry-exception.filter.ts
    │   ├── guards/
    │   │   └── jwt-auth.guard.ts
    │   ├── interceptors/
    │   │   └── transform.interceptor.ts
    │   └── prisma/
    │       ├── prisma.module.ts
    │       └── prisma.service.ts
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.module.ts
    │   │   ├── auth.service.ts
    │   │   ├── dto/
    │   │   └── strategies/
    │   ├── contacts/
    │   │   ├── contacts.controller.ts
    │   │   ├── contacts.module.ts
    │   │   ├── contacts.service.ts
    │   │   └── dto/
    │   ├── tasks/
    │   │   ├── tasks.controller.ts
    │   │   ├── tasks.module.ts
    │   │   ├── tasks.service.ts
    │   │   └── dto/
    │   ├── ai/
    │   │   ├── ai.controller.ts
    │   │   ├── ai.module.ts
    │   │   ├── ai.service.ts
    │   │   └── dto/
    │   ├── email/
    │   │   ├── email.controller.ts
    │   │   ├── email.module.ts
    │   │   ├── email.service.ts
    │   │   └── dto/
    │   └── cron/
    │       ├── cron.controller.ts
    │       ├── cron.module.ts
    │       └── cron.service.ts
    └── config/
        └── configuration.ts
```
