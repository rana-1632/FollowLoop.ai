"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Reply, PauseCircle, PlayCircle, Ban, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ReplyDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    id: string;
    name: string;
    email: string;
    company?: string;
    lastReplyContent?: string;
  } | null;
  onStatusUpdated?: () => void;
}

export default function ReplyDecisionModal({
  isOpen,
  onClose,
  contact,
  onStatusUpdated,
}: ReplyDecisionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen || !contact) return null;

  const handleDecision = async (action: "STOP" | "CONTINUE") => {
    setLoading(true);
    setActionSuccess(null);
    try {
      await api.contacts.updateSequenceStatus(contact.id, action);
      setActionSuccess(
        action === "STOP"
          ? "Sequence stopped successfully! Remaining tasks cancelled."
          : "Sequence resumed! Scheduled follow-ups will proceed on time."
      );
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => {
        setActionSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to update sequence status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReplyWorkflow = () => {
    onClose();
    const replySnippet = contact.lastReplyContent || `Hi, thanks for reaching out. We reviewed your details and would like to proceed.`;
    router.push(
      `/automation-builder?mode=post_reply&reply=${encodeURIComponent(replySnippet)}&contact=${encodeURIComponent(contact.name)}`
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-purple-900/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-soft">
                <Reply size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-ink">
                  Inbound Reply Received — Action Required
                </h3>
                <p className="text-xs text-ink-muted">
                  From: <span className="font-semibold text-purple-700">{contact.name}</span> &lt;{contact.email}&gt;
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            {/* Auto-Pause Status Warning */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-2xs">
              <PauseCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 text-sm">Sequence Automatically Paused</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  A reply from <span className="font-semibold">{contact.name}</span> was detected. All remaining scheduled follow-ups have been paused automatically to prevent sending redundant emails.
                </p>
              </div>
            </div>

            {/* Reply Content Preview */}
            <div className="rounded-2xl border border-border bg-canvas/60 p-4 text-xs">
              <p className="font-bold text-ink-muted uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                <MessageSquare size={12} className="text-purple-600" /> Received Reply Text:
              </p>
              <p className="text-ink font-medium leading-relaxed italic whitespace-pre-wrap">
                "{contact.lastReplyContent || "Hi! We received your proposal and would like to confirm our booking for next week."}"
              </p>
            </div>

            {/* Action Choice Heading */}
            <div className="pt-1">
              <h4 className="text-xs font-extrabold text-ink uppercase tracking-wider mb-2">
                What would you like to do next?
              </h4>

              {actionSuccess ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-pulse">
                  <CheckCircle2 size={16} /> {actionSuccess}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Stop Sequence */}
                  <button
                    onClick={() => handleDecision("STOP")}
                    disabled={loading}
                    className="flex flex-col items-start p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
                        <Ban size={14} />
                      </div>
                      <span className="text-xs font-bold text-rose-900">Stop Sequence</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      Permanently cancel all remaining follow-ups for this lead.
                    </p>
                  </button>

                  {/* Option 2: Continue Sequence */}
                  <button
                    onClick={() => handleDecision("CONTINUE")}
                    disabled={loading}
                    className="flex flex-col items-start p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                        <PlayCircle size={14} />
                      </div>
                      <span className="text-xs font-bold text-emerald-900">Continue Sequence</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-snug">
                      Resume scheduled follow-up emails on their original timeline.
                    </p>
                  </button>
                </div>
              )}
            </div>

            {/* Option 3: Post-Reply Nurture Workflow */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={handlePostReplyWorkflow}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-purple-500/20 shadow-md transition-all"
              >
                <Sparkles size={15} /> Start AI Post-Reply Workflow
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
