"use client";

import { useState } from "react";
import { Reply, ArrowRight, X } from "lucide-react";
import ReplyDecisionModal from "./ReplyDecisionModal";

interface ReplyNotificationBannerProps {
  repliedContact?: {
    id: string;
    name: string;
    email: string;
    company?: string;
    lastReplyContent?: string;
  } | null;
  onStatusUpdated?: () => void;
}

export default function ReplyNotificationBanner({
  repliedContact,
  onStatusUpdated,
}: ReplyNotificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!repliedContact || isDismissed) return null;

  return (
    <>
      <div className="mb-6 rounded-2xl border border-purple-300/80 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-4 text-white shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/30">
            <Reply size={20} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
                Inbound Email Reply Detected
              </h3>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">
              <span className="font-bold text-amber-300">{repliedContact.name}</span>
              {repliedContact.company ? ` (${repliedContact.company})` : ""} has responded. Remaining follow-ups are automatically paused.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 px-4 py-2 text-xs font-extrabold shadow-md transition-all"
          >
            Review &amp; Decide Action <ArrowRight size={14} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="rounded-xl p-2 text-purple-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <ReplyDecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={repliedContact}
        onStatusUpdated={onStatusUpdated}
      />
    </>
  );
}
