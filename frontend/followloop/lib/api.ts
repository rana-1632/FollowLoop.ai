/**
 * FollowLoop.ai API Client
 * Centralized service for communicating with NestJS Backend (http://localhost:3001/api/v1)
 */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  company?: string;
  companyName?: string;
  avatarUrl?: string;
  isOnboarded?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  user: User;
}

export type ContactStatus =
  | "New Lead"
  | "In Sequence"
  | "Awaiting Reply"
  | "Replied"
  | "Booked"
  | "Stalled";

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  avatarSeed?: string;
  status: ContactStatus;
  lastTouch: string;
  nextStep: string;
  score: number;
  phone?: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateContactDto {
  name: string;
  company: string;
  email: string;
  status?: ContactStatus;
  nextStep?: string;
  score?: number;
  notes?: string;
}

export interface UpdateContactDto {
  name?: string;
  company?: string;
  email?: string;
  status?: ContactStatus;
  lastTouch?: string;
  nextStep?: string;
  score?: number;
  notes?: string;
}

export interface AiSequenceStep {
  id: string;
  day: number;
  type: "email" | "wait" | "condition";
  subject?: string;
  body?: string;
  condition?: string;
}

export interface AiParseResponse {
  contact?: {
    name?: string;
    company?: string;
    email?: string;
  };
  summary?: string;
  suggestedFollowUpDate?: string;
  channel?: string;
  sequenceSteps: AiSequenceStep[];
  isFallback?: boolean;
  model?: string;
  generationEngine?: "LLM_AI" | "FALLBACK_RULE_ENGINE";
}

// Token Helper
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try localStorage keys
  const token =
    localStorage.getItem("followloop_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  if (token && token.trim().length > 0) {
    return token.trim();
  }

  // 2. Fallback to cookies
  try {
    const match = document.cookie.match(
      /(?:^|;\s*)(?:followloop_token|token|accessToken)=([^;]*)/
    );
    if (match && match[1]) {
      return decodeURIComponent(match[1]).trim();
    }
  } catch (e) {
    // Ignore cookie read issues
  }

  return null;
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined" || !token) return;
  const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

  localStorage.setItem("followloop_token", cleanToken);
  localStorage.setItem("token", cleanToken);
  localStorage.setItem("accessToken", cleanToken);

  try {
    document.cookie = `followloop_token=${cleanToken}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `token=${cleanToken}; path=/; max-age=604800; SameSite=Lax`;
  } catch (e) {
    // Ignore cookie write issues
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("followloop_token");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("followloop_user");

  try {
    document.cookie = "followloop_token=; path=/; max-age=0;";
    document.cookie = "token=; path=/; max-age=0;";
  } catch (e) {
    // Ignore cookie deletion issues
  }
}

// Error Formatter Helper to avoid rendering raw [object Object] or browser "Failed to fetch"
export function formatErrorMessage(errorData: any, fallback?: string): string {
  if (!errorData) return fallback || "An unexpected error occurred.";

  let rawStr = "";

  if (typeof errorData === "string") {
    rawStr = errorData;
  } else if (errorData instanceof Error) {
    rawStr = errorData.message || "";
  } else if (typeof errorData === "object" && errorData !== null) {
    const message =
      errorData.message ||
      errorData.error ||
      errorData.detail ||
      errorData.description;

    if (typeof message === "string") {
      rawStr = message;
    } else if (Array.isArray(message)) {
      rawStr = message
        .map((item) =>
          typeof item === "object" && item !== null
            ? JSON.stringify(item)
            : String(item)
        )
        .join(", ");
    } else if (typeof message === "object" && message !== null) {
      if (message.message) {
        rawStr = Array.isArray(message.message)
          ? message.message.join(", ")
          : String(message.message);
      } else {
        rawStr = JSON.stringify(message);
      }
    } else {
      try {
        rawStr = JSON.stringify(errorData);
      } catch {
        rawStr = "";
      }
    }
  }

  const lower = rawStr.toLowerCase();
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed") ||
    lower.includes("econnrefused") ||
    lower.includes("network request failed")
  ) {
    return "Unable to connect to the backend server. Please check your network connection or verify the server is running.";
  }

  if (rawStr && rawStr.trim().length > 0) {
    return rawStr;
  }

  return fallback || "An unexpected error occurred.";
}

// Lightweight In-Memory API Cache for Blazing-Fast Page Load Times & Instantaneous UI Rendering (<10ms)
const apiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 10000; // 10 seconds

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) {
      apiCache.delete(key);
    }
  }
}

// Generic Fetch Wrapper with Automatic Retry for Network Cold-Starts & Glitches
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    headers["Authorization"] = `Bearer ${cleanToken}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${endpoint}:${token || ""}`;

  // Stale-While-Revalidate Caching Strategy for GET Requests
  if (method === "GET") {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // Revalidate asynchronously in background
      fetch(url, { ...options, headers })
        .then((res) => (res.ok ? res.json() : null))
        .then((resJson) => {
          if (resJson) {
            const data =
              resJson && typeof resJson === "object" && "success" in resJson && "data" in resJson
                ? resJson.data
                : resJson;
            apiCache.set(cacheKey, { timestamp: Date.now(), data });
          }
        })
        .catch(() => null);
      return cached.data as T;
    }
  } else {
    // Invalidate API cache on mutation operations (POST, PUT, DELETE, PATCH)
    invalidateApiCache();
  }

  let response: Response | null = null;
  let attempt = 0;
  const maxRetries = method === "GET" ? 2 : 1; // Retry network glitches once for POST/PUT, twice for GET

  while (attempt <= maxRetries) {
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
      break; // Successfully received response from server
    } catch (fetchError: any) {
      attempt++;
      if (attempt > maxRetries) {
        const parsedMsg = formatErrorMessage(fetchError, "Unable to reach the backend server.");
        throw new Error(parsedMsg);
      }
      // Wait briefly before retrying (allows cold starts / transient drops to resolve)
      await new Promise((res) => setTimeout(res, attempt * 400));
    }
  }

  if (!response) {
    throw new Error("Unable to connect to the backend server.");
  }

  if (!response.ok) {
    // Automatic 401 Unauthorized handling for protected routes
    if (
      response.status === 401 &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/register")
    ) {
      clearStoredToken();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.location.href = "/login";
      }
    }

    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      const text = await response.text().catch(() => "");
      errorData = text || `HTTP ${response.status}: ${response.statusText}`;
    }

    const formattedMsg = formatErrorMessage(
      errorData,
      `HTTP ${response.status}: ${response.statusText}`
    );
    throw new Error(formattedMsg);
  }

  const resJson = await response.json();
  const resultData =
    resJson && typeof resJson === "object" && "success" in resJson && "data" in resJson
      ? resJson.data
      : resJson;

  if (method === "GET") {
    apiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
  }

  return resultData as T;
}

export function normalizeContact(raw: any): Contact {
  if (!raw) return raw;
  const statusMap: Record<string, ContactStatus> = {
    LEAD: "New Lead",
    IN_SEQUENCE: "In Sequence",
    AWAITING_REPLY: "Awaiting Reply",
    REPLIED: "Replied",
    BOOKED: "Booked",
    STALLED: "Stalled",
    "New Lead": "New Lead",
    "In Sequence": "In Sequence",
    "Awaiting Reply": "Awaiting Reply",
    Replied: "Replied",
    Booked: "Booked",
    Stalled: "Stalled",
  };

  const currentStage = raw.currentStage || raw.status || "New Lead";
  const mappedStatus: ContactStatus = statusMap[currentStage] || (currentStage as ContactStatus) || "New Lead";

  let lastTouchStr = "—";
  if (raw.lastInteractionDate || raw.updatedAt || raw.createdAt) {
    const dateVal = new Date(raw.lastInteractionDate || raw.updatedAt || raw.createdAt);
    if (!isNaN(dateVal.getTime())) {
      const diffHours = Math.floor((Date.now() - dateVal.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) lastTouchStr = "Just now";
      else if (diffHours < 24) lastTouchStr = `${diffHours}h ago`;
      else lastTouchStr = `${Math.floor(diffHours / 24)}d ago`;
    }
  } else if (raw.lastTouch) {
    lastTouchStr = raw.lastTouch;
  }

  return {
    id: raw.id,
    name: raw.name || "Unnamed Contact",
    company: raw.company || "Independent",
    email: raw.email || "No email",
    avatarSeed: raw.avatarSeed || raw.name || "User",
    status: mappedStatus,
    lastTouch: lastTouchStr,
    nextStep: raw.nextStep || (raw._count?.tasks ? `${raw._count.tasks} pending task(s)` : "No active task"),
    score: raw.score ?? (raw._count ? Math.min(100, 50 + (raw._count.tasks || 0) * 10 + (raw._count.emailLogs || 0) * 15) : 75),
    phone: raw.phone,
    notes: raw.notes,
    createdAt: raw.createdAt,
  };
}

function normalizeAiResponse(raw: any): AiParseResponse {
  if (!raw) {
    return { sequenceSteps: [] };
  }

  const name =
    raw.contact?.name ||
    raw.contactName ||
    raw.name ||
    raw.leadName ||
    undefined;

  const company =
    raw.contact?.company ||
    raw.companyName ||
    raw.company ||
    undefined;

  const email =
    raw.contact?.email ||
    raw.email ||
    undefined;

  const summary =
    raw.contextSummary ||
    raw.summary ||
    raw.notesSummary ||
    raw.context ||
    undefined;

  const suggestedFollowUpDate =
    raw.suggestedDate ||
    raw.suggestedFollowUpDate ||
    raw.followUpDate ||
    raw.nextFollowUp ||
    raw.scheduledDate ||
    undefined;

  const sequenceSteps: AiSequenceStep[] = [];

  // Parse initialDraft from ParseInteractionResponseDto
  if (raw.initialDraft && (raw.initialDraft.subject || raw.initialDraft.body)) {
    sequenceSteps.push({
      id: `step_init_${Date.now()}`,
      day: 0,
      type: "email",
      subject: raw.initialDraft.subject || "Initial Follow-up",
      body: raw.initialDraft.body || "",
    });
  }

  // Parse sequence1 and sequence2 from GenerateSequenceResponseDto
  if (raw.sequence1) {
    sequenceSteps.push({
      id: `step_seq1_${Date.now()}`,
      day: raw.sequence1.recommendedDelayDays || 3,
      type: "email",
      subject: raw.sequence1.subject || raw.sequence1.name || "Follow-up #1",
      body: raw.sequence1.body || "",
    });
  }
  if (raw.sequence2) {
    const delay1 = raw.sequence1?.recommendedDelayDays || 3;
    const delay2 = raw.sequence2.recommendedDelayDays || 7;
    sequenceSteps.push({
      id: `step_seq2_${Date.now()}`,
      day: delay1 + delay2,
      type: "email",
      subject: raw.sequence2.subject || raw.sequence2.name || "Follow-up #2",
      body: raw.sequence2.body || "",
    });
  }

  // Parse generic array steps if present
  const rawSteps =
    raw.sequenceSteps ||
    raw.emailSteps ||
    raw.steps ||
    raw.drafts ||
    raw.sequence;

  if (Array.isArray(rawSteps)) {
    rawSteps.forEach((s: any, idx: number) => {
      if (typeof s === "string") {
        sequenceSteps.push({
          id: `step_${idx}_${Date.now()}`,
          day: idx * 2,
          type: "email",
          subject: `Follow-up #${idx + 1}`,
          body: s,
        });
      } else if (s && typeof s === "object") {
        sequenceSteps.push({
          id: s.id || `step_${idx}_${Date.now()}`,
          day: s.day ?? s.delayDays ?? s.recommendedDelayDays ?? idx * 2,
          type: (s.type as any) || "email",
          subject: s.subject || s.title || s.name || `Follow-up Email #${idx + 1}`,
          body: s.body || s.content || s.text || "",
          condition: s.condition,
        });
      }
    });
  }

  const isFallback =
    raw.isFallback === true ||
    raw.model === "fallback-template" ||
    raw.generationEngine === "FALLBACK_RULE_ENGINE" ||
    raw.isMock === true;

  const generationEngine = isFallback ? "FALLBACK_RULE_ENGINE" : (raw.generationEngine || "LLM_AI");

  return {
    contact: name || company || email ? { name, company, email } : undefined,
    summary,
    suggestedFollowUpDate,
    sequenceSteps,
    isFallback,
    model: raw.model || (isFallback ? "fallback-template" : "llama-3.3-70b-versatile"),
    generationEngine,
  };
}

// API Service Methods
export const api = {
  // Authentication
  auth: {
    async login(email: string, password: string): Promise<AuthResponse> {
      const res = await request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const token =
        res.accessToken ||
        res.token ||
        (res as any).access_token ||
        (res as any).jwt;
      if (token) {
        setStoredToken(token);
      }
      return res;
    },

    async register(
      fullName: string,
      email: string,
      password: string,
      company?: string
    ): Promise<AuthResponse> {
      const res = await request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, company }),
      });
      const token =
        res.accessToken ||
        res.token ||
        (res as any).access_token ||
        (res as any).jwt;
      if (token) {
        setStoredToken(token);
      }
      return res;
    },

    async getMe(): Promise<User> {
      const res = await request<any>("/auth/me");
      if (res && res.user) {
        return res.user as User;
      }
      return res as User;
    },

    async updateProfile(dto: {
      fullName?: string;
      companyName?: string;
      avatarUrl?: string;
    }): Promise<User> {
      const res = await request<any>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      });
      if (res && res.user) {
        return res.user as User;
      }
      return res as User;
    },
  },

  // Contacts CRM
  contacts: {
    async getAll(): Promise<Contact[]> {
      const data = await request<any[]>("/contacts");
      return Array.isArray(data) ? data.map(normalizeContact) : [];
    },

    async getOne(id: string): Promise<Contact> {
      const data = await request<any>(`/contacts/${id}`);
      return normalizeContact(data);
    },

    async create(dto: CreateContactDto): Promise<Contact> {
      const data = await request<any>("/contacts", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      return normalizeContact(data);
    },

    async update(id: string, dto: UpdateContactDto): Promise<Contact> {
      const data = await request<any>(`/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
      return normalizeContact(data);
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/contacts/${id}`, {
        method: "DELETE",
      });
    },

    async updateSequenceStatus(
      id: string,
      action: "STOP" | "CONTINUE"
    ): Promise<Contact> {
      const data = await request<any>(`/contacts/${id}/sequence-status`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      return normalizeContact(data);
    },

    async getTimeline(id: string): Promise<{
      contact: any;
      timeline: Array<{
        id: string;
        type: string;
        title: string;
        description?: string;
        timestamp: string;
        badgeColor: string;
        meta?: any;
      }>;
    }> {
      return request<{
        contact: any;
        timeline: any[];
      }>(`/contacts/${id}/timeline`);
    },

    async getThread(id: string): Promise<{
      contact: any;
      messages: Array<{
        id: string;
        direction: "OUTBOUND" | "INBOUND";
        sender?: string;
        recipient?: string;
        subject?: string;
        bodyContent?: string;
        status?: string;
        createdAt: string;
      }>;
    }> {
      return request<{
        contact: any;
        messages: any[];
      }>(`/contacts/${id}/thread`);
    },

    async sendReply(
      id: string,
      dto: { subject: string; bodyContent: string }
    ): Promise<any> {
      return request<any>(`/contacts/${id}/send-reply`, {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },

  // AI Sequence Generation & Parsing
  ai: {
    async parseInteraction(
      text: string,
      tone: string = "Direct",
      senderName?: string
    ): Promise<AiParseResponse> {
      let raw: any;
      try {
        // Matches ParseInteractionDto ({ text: string, senderName?: string })
        raw = await request<any>("/ai/parse-interaction", {
          method: "POST",
          body: JSON.stringify({ text, senderName }),
        });
      } catch (err: any) {
        // Matches GenerateSequenceDto ({ previousMessage: string, tone: string })
        raw = await request<any>("/ai/generate-sequence", {
          method: "POST",
          body: JSON.stringify({ previousMessage: text, tone, senderName }),
        });
      }
      return normalizeAiResponse(raw);
    },

    async generateSequence(
      previousMessage: string,
      tone: string = "Direct"
    ): Promise<AiParseResponse> {
      // Matches GenerateSequenceDto ({ previousMessage: string, tone: string })
      const raw = await request<any>("/ai/generate-sequence", {
        method: "POST",
        body: JSON.stringify({ previousMessage, tone }),
      });
      return normalizeAiResponse(raw);
    },

    async generatePostReplySequence(
      replyText: string,
      contactId?: string,
      tone: string = "Consultative"
    ): Promise<AiParseResponse> {
      const raw = await request<any>("/ai/post-reply-sequence", {
        method: "POST",
        body: JSON.stringify({ replyText, contactId, tone }),
      });
      return normalizeAiResponse(raw);
    },
  },

  // Tasks / Sequences
  tasks: {
    async getAll(): Promise<any[]> {
      const data = await request<any[]>("/tasks");
      return Array.isArray(data) ? data : [];
    },
    async create(task: any): Promise<any> {
      return request<any>("/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      });
    },
    async update(id: string, dto: any): Promise<any> {
      return request<any>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
    },
    async delete(id: string): Promise<any> {
      return request<any>(`/tasks/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Sequences Management & Lead Tracking
  sequences: {
    async getLeads(sequenceId: string = "default"): Promise<any[]> {
      const data = await request<any[]>(`/sequences/${sequenceId}/leads`);
      return Array.isArray(data) ? data : [];
    },

    async stopLead(leadId: string): Promise<any> {
      return request<any>(`/sequences/leads/${leadId}/stop`, {
        method: "PATCH",
      });
    },

    async resumeLead(leadId: string): Promise<any> {
      return request<any>(`/sequences/leads/${leadId}/resume`, {
        method: "PATCH",
      });
    },
  },

  // Analytics & Email Logs
  analytics: {
    async getLogs(): Promise<any[]> {
      const data = await request<any[]>("/emails/logs");
      return Array.isArray(data) ? data : [];
    },

    async deleteLog(id: string): Promise<any> {
      return request<any>(`/emails/logs/${id}`, {
        method: "DELETE",
      });
    },

    async bulkDeleteLogs(logIds?: string[]): Promise<any> {
      return request<any>("/emails/logs/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ logIds }),
      });
    },
  },

  // User Email Accounts & Inbound Webhooks
  emailAccounts: {
    async connect(dto: {
      email: string;
      displayName?: string;
      provider?: string;
      smtpHost?: string;
      smtpPort?: number;
      username?: string;
      password?: string;
      isDefault?: boolean;
    }): Promise<any> {
      return request<any>("/emails/accounts", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },

    async list(): Promise<any[]> {
      const data = await request<any[]>("/emails/accounts");
      return Array.isArray(data) ? data : [];
    },

    async setDefault(accountId: string): Promise<any> {
      return request<any>(`/emails/accounts/${accountId}/default`, {
        method: "PATCH",
      });
    },

    async getGoogleOAuthUrl(): Promise<{ url: string }> {
      return request<{ url: string }>("/emails/oauth/google/url");
    },

    async getOutlookOAuthUrl(): Promise<{ url: string }> {
      return request<{ url: string }>("/emails/oauth/outlook/url");
    },

    async delete(accountId: string): Promise<any> {
      return request<any>(`/emails/accounts/${accountId}`, {
        method: "DELETE",
      });
    },

    async triggerInboundWebhook(dto: {
      from: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    }): Promise<any> {
      return request<any>("/emails/webhook/inbound", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },

  // Email API & Inbound Webhooks
  email: {
    async triggerInboundWebhook(dto: {
      from: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    }): Promise<any> {
      return request<any>("/emails/webhook/inbound", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },

  // Diagnostics & System Health
  diagnostics: {
    async checkEmailHealth(): Promise<any> {
      return request<any>("/diagnostics/email-check");
    },
  },
};

export default api;
