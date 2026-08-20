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
}

export const contacts: Contact[] = [];

export const statusStyles: Record<ContactStatus, string> = {
  "New Lead": "bg-slate-100 text-slate-700 border-slate-200",
  "In Sequence": "bg-accent-50 text-accent-700 border-accent-100",
  "Awaiting Reply": "bg-amber-50 text-amber-700 border-amber-100",
  "Replied": "bg-sky-50 text-sky-700 border-sky-100",
  "Booked": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Stalled": "bg-rose-50 text-rose-700 border-rose-100",
};

export const kanbanColumns: { id: ContactStatus; label: string }[] = [
  { id: "New Lead", label: "New Leads" },
  { id: "In Sequence", label: "In Sequence" },
  { id: "Awaiting Reply", label: "Awaiting Reply" },
  { id: "Replied", label: "Replied" },
  { id: "Booked", label: "Booked" },
  { id: "Stalled", label: "Stalled" },
];

export const activityFeed: Array<{ id: string; text: string; time: string; type: "reply" | "start" | "booked" | "sent" | "stalled" }> = [];

export const weeklyVolume: Array<{ day: string; sent: number; replied: number }> = [
  { day: "Mon", sent: 0, replied: 0 },
  { day: "Tue", sent: 0, replied: 0 },
  { day: "Wed", sent: 0, replied: 0 },
  { day: "Thu", sent: 0, replied: 0 },
  { day: "Fri", sent: 0, replied: 0 },
  { day: "Sat", sent: 0, replied: 0 },
  { day: "Sun", sent: 0, replied: 0 },
];

export const funnelData: Array<{ stage: string; value: number }> = [
  { stage: "Sent", value: 0 },
  { stage: "Opened", value: 0 },
  { stage: "Replied", value: 0 },
  { stage: "Booked", value: 0 },
];

export const deliveryLogs: Array<{ id: string; contact: string; subject: string; status: string; time: string }> = [];

export const deliveryStatusStyles: Record<string, string> = {
  Delivered: "bg-slate-100 text-slate-700",
  Opened: "bg-sky-50 text-sky-700",
  Replied: "bg-emerald-50 text-emerald-700",
  Bounced: "bg-rose-50 text-rose-700",
};

export const pricingTiers = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For solo founders and freelancers getting their first pipeline moving.",
    features: ["Up to 500 contacts", "3 active sequences", "AI sequence generation", "Email delivery tracking", "Standard support"],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$89",
    period: "/mo",
    description: "For small teams that live and die by follow-up discipline.",
    features: ["Up to 5,000 contacts", "Unlimited sequences", "AI reply detection", "CRM + Kanban pipeline", "Analytics & delivery logs", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For revenue teams that need automation with guardrails.",
    features: ["Unlimited contacts", "Multi-inbox rotation", "Custom AI tone training", "SSO & audit logs", "Dedicated success manager"],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export const testimonials = [
  {
    quote:
      "FollowLoop replaced four spreadsheets and a very tired VA. Our reply rate on cold outreach almost doubled in six weeks.",
    name: "Hamza Tariq",
    role: "CEO, Cyborg Developers",
    avatarUrl: "/testimonials/Hamza.jpeg",
    avatarSeed: "Hamza",
  },
  {
    quote:
      "I dropped in three bullet points from a call and it built a five-step sequence that actually sounded like me. Genuinely useful.",
    name: "Shazil Ahmad",
    role: "Head of Growth, Cane Technologies",
    avatarUrl: "/testimonials/Shazil.jpeg",
    avatarSeed: "Shazil",
  },
  {
    quote:
      "The Kanban view means nothing falls through the cracks anymore. My team can finally see the whole pipeline at a glance.",
    name: "Rayyan Ahmer",
    role: "CEO, Grand Luxe",
    avatarUrl: "/testimonials/Rayyan.jpeg",
    avatarSeed: "Rayyan",
  },
];

export const heroAvatars = [
  { name: "Hamza Tariq", src: "/testimonials/Hamza.jpeg" },
  { name: "Mohsin Ali", src: "/testimonials/Mohsin.jpeg" },
  { name: "Shazil Ahmad", src: "/testimonials/Shazil.jpeg" },
  { name: "Rayyan Ahmer", src: "/testimonials/Rayyan.jpeg" },
];

export const logos = [
  "Northwind", "Solace", "Vertex", "Fable & Co", "Lumen", "Orbital", "Bright Path", "Ferro",
];
