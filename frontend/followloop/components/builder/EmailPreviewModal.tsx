"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Check, Send } from "lucide-react";
import { useState } from "react";
import { SequenceStepData } from "./SequenceStep";
import { formatEmailBodyWithSignature } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function EmailPreviewModal({
  isOpen,
  onClose,
  step,
  contactName,
  contactCompany,
  contactEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  step: SequenceStepData | null;
  contactName?: string;
  contactCompany?: string;
  contactEmail?: string;
}) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !step) return null;

  const senderName = user?.fullName || "Sales Outreach Team";
  const senderEmail = user?.email || "outreach@followloop.ai";
  const senderCompany = user?.companyName || "FollowLoop Inc.";

  // Clean Recipient Label (No raw <> or generic "Prospect" word)
  const recipientDisplay = contactName && contactName !== "Lead Contact"
    ? `${contactName} (${contactEmail || "email@company.com"})`
    : contactEmail || "target@company.com";

  const displayDate = step.scheduledDate || `Day ${step.day}`;

  // Process body text into clean paragraphs & signature block using smart formatter
  const formattedBodyText = formatEmailBodyWithSignature(step.body, senderName, senderCompany);

  const handleCopy = async () => {
    const fullText = `To: ${recipientDisplay}\nSubject: ${step.subject}\nScheduled Date: ${displayDate}\n\n${formattedBodyText}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy email content:", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface shadow-modal"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white font-bold shadow-xs">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-ink">
                  Email Preview — Step {step.day ? `Day ${step.day}` : ""} ({displayDate})
                </h3>
                <p className="text-xs text-ink-muted">Rendered email draft as seen by target recipient</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Clean Webmail Envelope Header (Gmail / Outlook Style) */}
          <div className="border-b border-border bg-canvas/30 px-6 py-4 space-y-2 text-xs">
            {/* From Header */}
            <div className="flex items-center gap-2">
              <span className="w-16 font-bold text-ink-muted uppercase text-[10px] tracking-wider">From:</span>
              <span className="font-semibold text-ink">
                {senderName} <span className="text-ink-muted font-normal">({senderEmail})</span>
              </span>
            </div>

            {/* To Header */}
            <div className="flex items-center gap-2">
              <span className="w-16 font-bold text-ink-muted uppercase text-[10px] tracking-wider">To:</span>
              <span className="font-bold text-accent-700 bg-accent-50/90 px-2 py-0.5 rounded-md border border-accent-100 font-mono">
                {recipientDisplay}
              </span>
              {contactCompany && <span className="text-ink-muted">({contactCompany})</span>}
            </div>

            {/* Subject Header */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/40">
              <span className="w-16 font-bold text-ink-muted uppercase text-[10px] tracking-wider">Subject:</span>
              <span className="font-extrabold text-ink text-sm">{step.subject}</span>
            </div>

            {/* Scheduled Date Header */}
            {step.scheduledDate && (
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold text-ink-muted uppercase text-[10px] tracking-wider">Scheduled:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {step.scheduledDate}
                </span>
              </div>
            )}
          </div>

          {/* Formatted Professional Email Body */}
          <div className="p-6">
            <div className="min-h-[220px] rounded-2xl border border-border/70 bg-surface p-6 text-sm leading-relaxed text-ink shadow-inner whitespace-pre-line font-sans space-y-4">
              {formattedBodyText}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border bg-canvas/40 px-6 py-4">
            <button
              onClick={handleCopy}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 font-bold"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied Email!" : "Copy Email Draft"}</span>
            </button>

            <button onClick={onClose} className="btn-accent py-2 px-5 text-xs font-bold">
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
