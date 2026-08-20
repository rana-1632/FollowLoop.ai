"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Plus,
  Wand2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Reply,
  MessageSquare,
  ShieldCheck,
  Layers,
  Trash2,
  Cpu,
  FileText,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ProfileModal from "@/components/dashboard/ProfileModal";
import EmailAccountsModal from "@/components/dashboard/EmailAccountsModal";
import SequenceStep, { SequenceStepData } from "@/components/builder/SequenceStep";
import ExtractedContactCard from "@/components/builder/ExtractedContactCard";
import EmailPreviewModal from "@/components/builder/EmailPreviewModal";
import { api, AiParseResponse, formatErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

const SAMPLE_NOTES =
  "Met with Ahmed regarding the Grand Luxe Wedding Hall booking for November 15. He wants 250 guest seating, catering package B, and audio setup. Budget is around $12,000. He requested a formal quotation by Friday and wants to schedule a venue walkthrough next Tuesday.";

const SAMPLE_REPLY =
  "Hi! Yes, we reviewed the venue walkthrough quote and would like to confirm our booking for November 15. Could you send over the final calendar invite for next Tuesday at 3 PM?";

const tones = ["Consultative", "Direct", "Casual", "Formal"];

export default function AutomationBuilderPage() {
  const { user } = useAuth();
  const { isCollapsed } = useLayout();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showEmailAccountsModal, setShowEmailAccountsModal] = useState<boolean>(false);
  const [mode, setMode] = useState<"initial" | "post_reply">("initial");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState("Consultative");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<SequenceStepData[]>([]);
  const [parsedData, setParsedData] = useState<AiParseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>("");

  // Pre-fill sender name from logged-in user profile if available
  useEffect(() => {
    if (user?.fullName && !senderName) {
      setSenderName(user.fullName);
    }
  }, [user]);

  // Clean signature helper to automatically replace [Your Name] and format sign-offs
  const cleanSignature = (bodyText: string, nameToUse?: string): string => {
    if (!bodyText) return bodyText;
    const name = (nameToUse !== undefined ? nameToUse : senderName).trim();

    // 1. Replace bracket placeholders
    let text = bodyText
      .replace(/\[Your Name(?:\/[^\]]+)?\]/gi, name || "[Your Name]")
      .replace(/\[Your (?:Full Name|Position|Title|Company)\]/gi, name || "")
      .replace(/\[Sender Name\]/gi, name || "[Your Name]");

    // 2. If name is available, ensure it follows "Best regards," sign-offs
    if (name) {
      const signoffPattern = /(Best regards,|Warm regards,|Sincerely,|Thanks,|Best,)\s*(\[Your Name\])?\s*$/i;
      if (signoffPattern.test(text)) {
        text = text.replace(signoffPattern, `$1\n${name}`);
      }
    }

    return text;
  };

  const handleSenderNameChange = (newName: string) => {
    setSenderName(newName);
    if (steps.length > 0) {
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          body: cleanSignature(step.body || "", newName),
        }))
      );
    }
  };

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Missing Email Prompt Modal State
  const [showEmailPromptModal, setShowEmailPromptModal] = useState<boolean>(false);
  const [promptEmailInput, setPromptEmailInput] = useState<string>("");

  // Email Preview Modal state
  const [previewStep, setPreviewStep] = useState<SequenceStepData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const stages = [
    "Connecting to NestJS AI Engine…",
    mode === "post_reply"
      ? "Analyzing reply sentiment & customer intent…"
      : "Extracting contact metadata & sequence intent…",
    "Tailoring multi-step follow-up timeline…",
    "Rendering real response payload…",
  ];
  const [stageIndex, setStageIndex] = useState(0);

  // Check URL parameters for post-reply triggers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get("mode");
      const urlReply = params.get("reply");

      if (urlMode === "post_reply") {
        setMode("post_reply");
        if (urlReply) {
          setNotes(decodeURIComponent(urlReply));
        } else {
          setNotes(SAMPLE_REPLY);
        }
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setErrorMsg(null);
    setSteps([]);
    setParsedData(null);
    setSavedSuccess(false);

    // Visual progress stages
    setStageIndex(0);
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      let res: AiParseResponse;
      const activeSender = senderName || user?.fullName || undefined;
      if (mode === "post_reply") {
        res = await api.ai.generatePostReplySequence(notes.trim(), undefined, tone);
      } else {
        res = await api.ai.parseInteraction(notes.trim(), tone, activeSender);
      }

      clearInterval(stageInterval);

      if (res) {
        // Robust fallback regex parsing to ensure explicit email address in text is bound to contact.email
        const textEmailMatch = notes.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
        const extractedTextEmail = textEmailMatch ? textEmailMatch[0] : null;
        // Do NOT invent or guess email addresses; leave empty if not explicitly present in prompt
        const finalEmail =
          extractedTextEmail ||
          (res.contact?.email &&
          res.contact.email.includes("@") &&
          !res.contact.email.includes("followloop.com")
            ? res.contact.email
            : "");

        const updatedRes: AiParseResponse = {
          ...res,
          contact: {
            ...res.contact,
            email: finalEmail,
          },
        };
        setParsedData(updatedRes);

        const baseTime = res.suggestedFollowUpDate
          ? new Date(res.suggestedFollowUpDate).getTime()
          : Date.now() + 86400000;

        if (res.sequenceSteps && res.sequenceSteps.length > 0) {
          setSteps(
            res.sequenceSteps.map((s, idx) => {
              const dayDelay = s.day ?? (idx === 0 ? 1 : idx * 3);
              const schedDate = new Date(baseTime + dayDelay * 86400000)
                .toISOString()
                .split("T")[0];
              const rawBody = s.body || (s as any).content || "";
              const formattedBody = cleanSignature(rawBody, activeSender);
              return {
                id: s.id || `step_${idx}_${Date.now()}`,
                day: dayDelay,
                type: (s.type as any) || "email",
                channel: (res.channel as any) || "EMAIL",
                subject: s.subject || `Follow-up #${idx + 1}`,
                body: formattedBody,
                condition: s.condition,
                scheduledDate: schedDate,
              };
            })
          );
        } else {
          // Default initial step with scheduled date
          const defaultDate = new Date(baseTime).toISOString().split("T")[0];
          const defaultSignOff = activeSender ? `\n\nBest regards,\n${activeSender}` : `\n\nBest regards,`;
          setSteps([
            {
              id: `step_init_${Date.now()}`,
              day: 1,
              type: "email",
              channel: (res.channel as any) || "EMAIL",
              subject: `Follow-up #1: Thank you for reaching out`,
              body: `Hi ${res.contact?.name || "there"},\n\nThank you for reaching out. I'm following up on our recent conversation.${defaultSignOff}`,
              scheduledDate: defaultDate,
            },
          ]);
        }
      } else {
        throw new Error("No response payload received from AI endpoint.");
      }
    } catch (err: any) {
      clearInterval(stageInterval);
      console.error("AI Generation Error:", err);
      setErrorMsg(
        formatErrorMessage(
          err,
          "Failed to reach backend AI endpoint. Ensure NestJS backend is running at http://localhost:3001."
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToCrm = (emailOverride?: string) => {
    setErrorMsg(null);
    const textEmailMatch = notes.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const extractedEmail = textEmailMatch ? textEmailMatch[0] : null;
    const contactEmail = emailOverride || parsedData?.contact?.email || extractedEmail;

    // Prompt user for missing recipient email address via pop-up modal if empty
    if (!contactEmail || !contactEmail.includes("@")) {
      setPromptEmailInput("");
      setShowEmailPromptModal(true);
      return;
    }

    executeSaveToCrm(contactEmail);
  };

  const executeSaveToCrm = async (targetEmail: string) => {
    setSaving(true);
    setErrorMsg(null);

    try {
      const contactName = parsedData?.contact?.name || "Lead Prospect";
      const companyName = parsedData?.contact?.company || "General Inquiry";

      const createdContact = await api.contacts.create({
        name: contactName,
        company: companyName,
        email: targetEmail,
        status: mode === "post_reply" ? "In Sequence" : "In Sequence",
        nextStep: parsedData?.suggestedFollowUpDate || "Follow-up #1 scheduled",
        score: 85,
        notes: notes,
      });

      if (createdContact && createdContact.id && steps.length > 0) {
        for (const step of steps) {
          try {
            const taskDate = step.scheduledDate
              ? new Date(step.scheduledDate).toISOString()
              : new Date(Date.now() + (step.day || 1) * 86400000).toISOString();

            await api.tasks.create({
              contactId: createdContact.id,
              suggestedDate: taskDate,
              title: step.subject || `Follow-up Step (Day ${step.day})`,
              aiGeneratedContent: step.body,
              subjectLine: step.subject,
              status: "PENDING",
            });
          } catch (taskErr) {
            console.warn("Creating task for step failed:", taskErr);
          }
        }
      }

      setSavedSuccess(true);
    } catch (err: any) {
      console.warn("Save contact to backend failed:", err);
      setErrorMsg(formatErrorMessage(err, "Failed to save contact to backend CRM."));
    } finally {
      setSaving(false);
    }
  };

  // Requirement 4: Follow-up Management - Auto-adjust step indices and dates on removal
  const removeStep = (id: string) => {
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      const baseTime = parsedData?.suggestedFollowUpDate
        ? new Date(parsedData.suggestedFollowUpDate).getTime()
        : Date.now() + 86400000;

      return filtered.map((s, idx) => {
        const adjustedDay = idx === 0 ? 1 : idx * 3;
        const adjustedDate = new Date(baseTime + adjustedDay * 86400000)
          .toISOString()
          .split("T")[0];

        return {
          ...s,
          day: adjustedDay,
          scheduledDate: s.scheduledDate || adjustedDate,
        };
      });
    });
  };

  const handleUpdateStep = (id: string, updated: Partial<SequenceStepData>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const handleAddStep = () => {
    const lastDay = steps.length > 0 ? steps[steps.length - 1].day : 0;
    const nextDay = steps.length === 0 ? 1 : lastDay + 3;
    const baseTime = parsedData?.suggestedFollowUpDate
      ? new Date(parsedData.suggestedFollowUpDate).getTime()
      : Date.now() + 86400000;

    const nextDate = new Date(baseTime + nextDay * 86400000)
      .toISOString()
      .split("T")[0];

    const newStep: SequenceStepData = {
      id: `step_custom_${Date.now()}`,
      day: nextDay,
      type: "email",
      channel: (parsedData?.channel as any) || "EMAIL",
      subject: `Follow-up #${steps.length + 1}: Next steps`,
      body: `Hi ${parsedData?.contact?.name || "there"},\n\nI wanted to check in on our previous discussion. Let me know when you have a moment to connect.\n\nBest regards,`,
      scheduledDate: nextDate,
    };
    setSteps((prev) => [...prev, newStep]);
  };

  const handleClearAllSteps = () => setSteps([]);

  const handleOpenPreview = (step: SequenceStepData) => {
    setPreviewStep(step);
    setIsPreviewOpen(true);
  };

  const handleUpdateMetadata = (meta: {
    name: string;
    company: string;
    email: string;
    date: string;
    channel: string;
  }) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      contact: {
        ...parsedData.contact,
        name: meta.name,
        company: meta.company,
        email: meta.email,
      },
      suggestedFollowUpDate: meta.date,
      channel: meta.channel as any,
    });
  };

  const leadName = parsedData?.contact?.name;
  const leadCompany = parsedData?.contact?.company;
  const leadEmail = parsedData?.contact?.email;

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar onOpenProfile={() => setShowProfileModal(true)} />
      <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <Topbar
          title="Sequence Builder & Smart Nurture"
          subtitle="Turn raw interaction notes or incoming customer replies into fully customized follow-up sequences."
          onOpenProfile={() => setShowProfileModal(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Requirement 3: Authenticated Email Sender Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-200/90 bg-gradient-to-r from-accent-50/70 via-surface to-purple-50/40 p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-xs">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Authenticated Sending Account:
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                  </span>
                </div>
                <p className="text-xs font-medium text-ink-soft">
                  <span className="font-bold text-accent-700">{user?.fullName || "Sales Rep"}</span> &lt;{user?.email || "outreach@followloop.ai"}&gt; — Outbound follow-ups will be dispatched on your behalf.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEmailAccountsModal(true)}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 font-bold shadow-xs"
            >
              <Mail size={13} /> Manage Connected Accounts
            </button>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[440px_1fr]">
            {/* Input Panel */}
            <div className="card xl:sticky xl:top-24 h-fit p-4 sm:p-6">
              {/* Sequence Mode Selector */}
              <div className="mb-5 flex rounded-xl border border-border p-1 bg-surface-muted/50">
                <button
                  type="button"
                  onClick={() => {
                    setMode("initial");
                    setNotes("");
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                    mode === "initial"
                      ? "bg-surface text-ink shadow-sm border border-border"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <MessageSquare size={13} /> Initial Outreach
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("post_reply");
                    setNotes(SAMPLE_REPLY);
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                    mode === "post_reply"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Reply size={13} /> Post-Reply Nurture
                </button>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-white",
                      mode === "post_reply" ? "bg-purple-600" : "bg-ink"
                    )}
                  >
                    {mode === "post_reply" ? <Reply size={13} /> : <Sparkles size={13} />}
                  </div>
                  <h2 className="text-sm font-bold text-ink">
                    {mode === "post_reply"
                      ? "Paste Customer Reply Message"
                      : "Describe your lead / interaction"}
                  </h2>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  mode === "post_reply"
                    ? "Paste the incoming email reply received from your lead..."
                    : "Paste call notes, transcript, meeting summary, or deal details..."
                }
                rows={7}
                className="input-field resize-none text-xs leading-relaxed"
              />

              <button
                onClick={() => setNotes(mode === "post_reply" ? SAMPLE_REPLY : SAMPLE_NOTES)}
                className="mt-1.5 text-xs font-medium text-accent-600 hover:text-accent-700"
              >
                Insert example {mode === "post_reply" ? "customer reply" : "meeting note"}
              </button>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <p className="mb-1.5 text-xs font-bold text-ink-soft">Tone of Voice</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          tone === t
                            ? "border-accent-300 bg-accent-50 text-accent-700 font-bold"
                            : "border-border text-ink-muted hover:border-border-strong hover:text-ink"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-ink-soft">
                    Sender Sign-off / Signature
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => handleSenderNameChange(e.target.value)}
                    placeholder="e.g. Mohsin Ali"
                    className="input-field text-xs py-1.5 px-3 w-full rounded-xl"
                  />
                  <p className="mt-1 text-[10px] text-ink-muted">
                    Auto-replaces [Your Name] in all email sequence sign-offs.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !notes.trim()}
                className={cn(
                  "mt-6 w-full py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-md",
                  mode === "post_reply"
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
                    : "btn-accent"
                )}
              >
                {generating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> {stages[stageIndex]}
                  </>
                ) : (
                  <>
                    <Wand2 size={15} /> {mode === "post_reply" ? "Generate Post-Reply Sequence" : "Generate Outreach Sequence"}
                  </>
                )}
              </button>

              {/* API Error Banner */}
              {errorMsg && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Backend Communication Error</p>
                    <p className="mt-0.5 text-rose-600">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Output Panel */}
            <div>
              {/* AI Status Banner */}
              {parsedData?.isFallback && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-sky-950 text-xs flex items-center gap-2">
                        Standard Outreach Template
                        <span className="rounded-full bg-sky-100 text-sky-800 px-2 py-0.5 text-[10px] font-bold border border-sky-200">
                          Template Engine
                        </span>
                      </p>
                      <p className="text-sky-800 text-[11px] mt-0.5">
                        This sequence was generated using FollowLoop's standard outreach template. All email subject lines, body copy, and delay schedules remain 100% editable below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parsedData && !parsedData.isFallback && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-2xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                        Smart AI Outreach Sequence
                        <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold border border-purple-200">
                          AI Powered
                        </span>
                      </p>
                      <p className="text-purple-800 text-[11px] mt-0.5">
                        Context-aware email drafts customized directly from your interaction notes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Contact Card */}
              {parsedData && (
                <ExtractedContactCard
                  parsedData={parsedData}
                  onUpdateMetadata={handleUpdateMetadata}
                />
              )}

              {/* Sequence Header & Action Controls */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    {steps.length > 0
                      ? leadName
                        ? `${mode === "post_reply" ? "Post-Reply Nurture Timeline" : "Outreach Sequence Timeline"} — ${leadName}${leadCompany ? ` (${leadCompany})` : ""}`
                        : `Generated Multi-Step Sequence (${steps.length} steps)`
                      : "Your customized sequence will appear here"}
                  </h2>
                  {steps.length > 0 && (
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-1 font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-md border border-accent-100">
                        <Layers size={12} /> Total Follow-Ups: {steps.length}
                      </span>
                      <span>• Fully editable sending dates &amp; recipient envelope</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddStep}
                    className="btn-secondary py-2 text-xs flex items-center gap-1.5 font-bold"
                    title="Add a custom step to the sequence"
                  >
                    <Plus size={13} /> Add Follow-Up
                  </button>

                  {steps.length > 0 && (
                    <>
                      <button
                        onClick={handleClearAllSteps}
                        className="rounded-xl border border-rose-200 bg-surface text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs font-semibold transition-colors"
                        title="Delete all steps"
                      >
                        <Trash2 size={13} />
                      </button>

                      <button
                        onClick={() => handleSaveToCrm()}
                        disabled={saving || savedSuccess}
                        className={cn(
                          "btn-accent py-2 text-xs flex items-center gap-1.5 font-bold cursor-pointer",
                          savedSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        {saving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : savedSuccess ? (
                          <>
                            <CheckCircle2 size={13} /> Saved to CRM!
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> Save to CRM Pipeline
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Multi-step Vertical Sequence Timeline */}
              {steps.length === 0 && !generating ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/40 py-20 text-center p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-soft">
                    {mode === "post_reply" ? (
                      <Reply size={22} className="text-purple-600" />
                    ) : (
                      <Sparkles size={22} className="text-accent-400" />
                    )}
                  </div>
                  <p className="max-w-xs text-sm font-medium text-ink">
                    {mode === "post_reply"
                      ? "Paste an incoming customer reply on the left to build a post-reply continuation sequence."
                      : "Paste raw interaction notes on the left and click \"Generate Outreach Sequence\"."}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted max-w-sm">
                    FollowLoop AI will construct a vertical multi-step follow-up timeline with full user control over timing, dates, and email copy.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleAddStep}
                      className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> Create Blank Step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative pl-2 pt-2 space-y-4">
                  <AnimatePresence>
                    {steps.map((step, i) => (
                      <SequenceStep
                        key={step.id}
                        step={step}
                        index={i}
                        totalSteps={steps.length}
                        contactEmail={leadEmail}
                        contactName={leadName}
                        onRemove={removeStep}
                        onUpdateStep={handleUpdateStep}
                        onPreviewStep={handleOpenPreview}
                      />
                    ))}
                  </AnimatePresence>

                  {steps.length > 0 && (
                    <div className="pt-2 flex justify-center">
                      <button
                        onClick={handleAddStep}
                        className="w-full py-3 text-xs flex items-center justify-center gap-2 border-2 border-dashed border-accent-200 hover:border-accent-400 hover:bg-accent-50/60 text-accent-700 font-bold rounded-2xl transition-all shadow-xs"
                      >
                        <Plus size={15} /> Add Next Follow-Up Step
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Missing Recipient Email Prompt Modal */}
      {showEmailPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md card p-6 bg-surface shadow-2xl relative border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Enter Recipient Email Address</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Specify the recipient email address for <span className="font-bold text-ink">{parsedData?.contact?.name || "this lead"}</span> to enable sequence dispatches.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (promptEmailInput && promptEmailInput.includes("@")) {
                  const validEmail = promptEmailInput.trim();
                  handleUpdateMetadata({
                    name: parsedData?.contact?.name || "Lead Prospect",
                    company: parsedData?.contact?.company || "",
                    email: validEmail,
                    date: parsedData?.suggestedFollowUpDate || new Date().toISOString().split("T")[0],
                    channel: parsedData?.channel || "EMAIL",
                  });
                  setShowEmailPromptModal(false);
                  executeSaveToCrm(validEmail);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="e.g. contact@10pearls.com"
                  value={promptEmailInput}
                  onChange={(e) => setPromptEmailInput(e.target.value)}
                  className="input-field text-xs font-bold bg-surface"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEmailPromptModal(false)}
                  className="btn-secondary flex-1 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!promptEmailInput.includes("@")}
                  className="btn-accent flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Confirm &amp; Save to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Email Accounts Modal */}
      <EmailAccountsModal
        isOpen={showEmailAccountsModal}
        onClose={() => setShowEmailAccountsModal(false)}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        step={previewStep}
        contactName={parsedData?.contact?.name}
        contactCompany={parsedData?.contact?.company}
        contactEmail={parsedData?.contact?.email}
      />
    </div>
  );
}
