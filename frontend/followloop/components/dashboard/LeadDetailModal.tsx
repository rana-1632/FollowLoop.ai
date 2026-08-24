"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  History,
  Send,
  Loader2,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Play,
  Square,
  ArrowRight,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { Contact, ContactStatus, statusStyles } from "@/lib/data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface LeadDetailModalProps {
  contactId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated?: () => void;
  initialTab?: "unibox" | "timeline";
}

export default function LeadDetailModal({
  contactId,
  isOpen,
  onClose,
  onContactUpdated,
  initialTab = "unibox",
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"unibox" | "timeline">(initialTab);
  const [contact, setContact] = useState<Contact | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // Quick Reply form state
  const [replySubject, setReplySubject] = useState<string>("");
  const [replyBody, setReplyBody] = useState<string>("");
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadLeadData = async () => {
    if (!contactId) return;
    try {
      setLoading(true);
      const [contactRes, timelineRes, threadRes] = await Promise.allSettled([
        api.contacts.getOne(contactId),
        api.contacts.getTimeline(contactId),
        api.contacts.getThread(contactId),
      ]);

      if (contactRes.status === "fulfilled") {
        setContact(contactRes.value);
      }

      if (timelineRes.status === "fulfilled" && Array.isArray(timelineRes.value.timeline)) {
        setTimeline(timelineRes.value.timeline);
      } else {
        setTimeline([]);
      }

      if (threadRes.status === "fulfilled" && Array.isArray(threadRes.value.messages)) {
        const msgs = threadRes.value.messages;
        setMessages(msgs);
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          const lastSubj = lastMsg.subject || "";
          setReplySubject(lastSubj.startsWith("Re:") ? lastSubj : `Re: ${lastSubj}`);
        }
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Could not load lead detail data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contactId) {
      loadLeadData();
    }
  }, [isOpen, contactId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !replyBody.trim()) return;

    setSendingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      await api.contacts.sendReply(contactId, {
        subject: replySubject || `Re: Follow-up with ${contact?.name || "Lead"}`,
        bodyContent: replyBody,
      });

      // Optimistic message append
      const newMsg = {
        id: `optimistic_${Date.now()}`,
        direction: "OUTBOUND" as const,
        sender: "You (FollowLoop)",
        recipient: contact?.email || "",
        subject: replySubject,
        bodyContent: replyBody,
        status: "SENT",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setReplyBody("");
      setReplySuccess("Reply sent successfully via FollowLoop engine!");

      if (onContactUpdated) onContactUpdated();
      setTimeout(() => setReplySuccess(null), 4000);
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply. Please verify email settings.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleSequence = async () => {
    if (!contact) return;
    const action = contact.status === "Stalled" ? "CONTINUE" : "STOP";
    try {
      const updated = await api.contacts.updateSequenceStatus(contact.id, action);
      setContact(updated);
      if (onContactUpdated) onContactUpdated();
      loadLeadData();
    } catch (err) {
      console.warn("Failed to toggle sequence status:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-4xl card bg-surface shadow-2xl overflow-hidden my-auto border border-border flex flex-col max-h-[90vh]"
        >
          {/* Header Panel */}
          <div className="bg-surface-muted/60 border-b border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <UserAvatar name={contact?.name || "L"} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink truncate">{contact?.name || "Lead Details"}</h2>
                  {contact?.status && (
                    <span
                      className={cn(
                        "pill text-[11px] font-bold border px-2.5 py-0.5",
                        statusStyles[contact.status] || "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {contact.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Building size={12} /> {contact?.company || "Independent"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {contact?.email || "No email"}
                  </span>
                  {contact?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {contact.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {contact && (
                <button
                  onClick={handleToggleSequence}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-soft",
                    contact.status === "Stalled"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  )}
                >
                  {contact.status === "Stalled" ? (
                    <>
                      <Play size={12} /> Resume Sequence
                    </>
                  ) : (
                    <>
                      <Square size={12} /> Pause Sequence
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-surface px-5 pt-2 gap-4">
            <button
              onClick={() => setActiveTab("unibox")}
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all",
                activeTab === "unibox"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              <MessageSquare size={14} /> Unified Conversation (Unibox)
              {messages.length > 0 && (
                <span className="rounded-full bg-accent-100 text-accent-700 px-2 py-0.5 text-[10px]">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all",
                activeTab === "timeline"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              <History size={14} /> Activity Timeline (Audit Trail)
              {timeline.length > 0 && (
                <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px]">
                  {timeline.length}
                </span>
              )}
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 bg-canvas">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-accent-500 mb-3" />
                <p className="text-xs text-ink-muted">Loading lead conversation & audit trail...</p>
              </div>
            ) : activeTab === "unibox" ? (
              /* TAB 1: UNIFIED CONVERSATION VIEW (UNIBOX / THREADING) */
              <div className="space-y-6">
                {/* Threaded Message History */}
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="card p-8 text-center bg-surface flex flex-col items-center">
                      <Inbox size={28} className="text-ink-muted mb-2" />
                      <p className="text-sm font-bold text-ink">No conversation messages yet</p>
                      <p className="text-xs text-ink-muted max-w-sm mt-1">
                        When automated follow-up emails are sent or the lead sends an inbound reply, back-and-forth messages will appear here.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isInbound = msg.direction === "INBOUND" || msg.status === "REPLIED";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[85%] rounded-2xl p-4 shadow-soft text-sm transition-all",
                            isInbound
                              ? "self-start bg-surface border border-emerald-200/80 mr-auto text-ink"
                              : "self-end bg-accent-600 text-white ml-auto"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-border/40">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider",
                                  isInbound ? "bg-emerald-100 text-emerald-800" : "bg-accent-500 text-white"
                                )}
                              >
                                {isInbound ? "📥 Inbound Reply" : "📤 Outbound Email"}
                              </span>
                              <span className="text-xs font-semibold opacity-90 truncate max-w-[200px]">
                                {msg.subject || "No Subject"}
                              </span>
                            </div>
                            <span className="text-[10px] opacity-75 shrink-0">
                              {new Date(msg.createdAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans opacity-95">
                            {msg.bodyContent || "No body text available."}
                          </div>

                          <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] opacity-80">
                            <span>From: {msg.sender || "FollowLoop"}</span>
                            <span>To: {msg.recipient}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Reply Form */}
                <div className="card p-4 bg-surface border border-border shadow-card mt-6">
                  <h3 className="text-xs font-bold text-ink mb-3 flex items-center gap-2">
                    <Send size={14} className="text-accent-500" /> Send Quick Reply inside FollowLoop
                  </h3>

                  {replySuccess && (
                    <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={14} /> {replySuccess}
                    </div>
                  )}

                  {replyError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium flex items-center gap-2">
                      <AlertCircle size={14} /> {replyError}
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Subject Line"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="input-field text-xs bg-canvas"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        required
                        placeholder={`Type your reply to ${contact?.name || "lead"}...`}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="input-field text-xs bg-canvas resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingReply || !replyBody.trim()}
                        className="btn-accent px-4 py-2 text-xs flex items-center gap-2 shadow-soft"
                      >
                        {sendingReply ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Dispatching...
                          </>
                        ) : (
                          <>
                            <Send size={13} /> Send Reply &rarr;
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* TAB 2: LEAD ACTIVITY TIMELINE (AUDIT TRAIL) */
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timeline.length === 0 ? (
                  <div className="card p-8 text-center bg-surface flex flex-col items-center">
                    <History size={28} className="text-ink-muted mb-2" />
                    <p className="text-sm font-bold text-ink">No activity records logged yet</p>
                  </div>
                ) : (
                  timeline.map((event, idx) => {
                    const badgeClass =
                      event.badgeColor === "emerald"
                        ? "bg-emerald-500 text-white"
                        : event.badgeColor === "indigo"
                        ? "bg-indigo-600 text-white"
                        : event.badgeColor === "purple"
                        ? "bg-purple-600 text-white"
                        : event.badgeColor === "amber"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-600 text-white";

                    return (
                      <motion.div
                        key={event.id || idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="relative card p-4 bg-surface shadow-soft border border-border"
                      >
                        {/* Glowing Node Dot */}
                        <div
                          className={cn(
                            "absolute -left-[27px] top-4 h-4 w-4 rounded-full border-2 border-surface shadow-sm flex items-center justify-center text-[8px]",
                            badgeClass
                          )}
                        />

                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md uppercase", badgeClass)}>
                              {event.type.replace("_", " ")}
                            </span>
                            <h4 className="text-xs font-bold text-ink">{event.title}</h4>
                          </div>

                          <span className="text-[10px] text-ink-muted shrink-0 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(event.timestamp).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {event.description && (
                          <div className="mt-2 rounded-xl bg-canvas p-3 text-xs text-ink-soft leading-relaxed border border-border/40 font-mono">
                            {event.description}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
