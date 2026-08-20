import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Building, Sparkles } from "lucide-react";
import { Contact, ContactStatus, kanbanColumns } from "@/lib/data";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface KanbanBoardProps {
  contacts: Contact[];
  onStatusChange?: (id: string, newStatus: ContactStatus) => void;
  onAddContactToStatus?: (status: ContactStatus) => void;
}

const columnMeta: Record<
  ContactStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  "New Lead": {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
  },
  "In Sequence": {
    bg: "bg-accent-50/70",
    text: "text-accent-700",
    border: "border-accent-200/80",
    dot: "bg-accent-500",
  },
  "Awaiting Reply": {
    bg: "bg-amber-50/70",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
  "Replied": {
    bg: "bg-sky-50/70",
    text: "text-sky-700",
    border: "border-sky-200/80",
    dot: "bg-sky-500",
  },
  "Booked": {
    bg: "bg-emerald-50/70",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  "Stalled": {
    bg: "bg-rose-50/70",
    text: "text-rose-700",
    border: "border-rose-200/80",
    dot: "bg-rose-500",
  },
};

function KanbanBoard({
  contacts = [],
  onStatusChange,
  onAddContactToStatus,
}: KanbanBoardProps) {
  // Filter out any legacy invalid/fake entries like "HR Department"
  const validContacts = useMemo(
    () => contacts.filter((c) => c && c.name && c.name !== "HR Department" && c.name !== "HR"),
    [contacts]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin snap-x">
      {kanbanColumns.map((col, colIndex) => {
        const items = validContacts.filter((c) => c.status === col.id);
        const meta = columnMeta[col.id] || columnMeta["New Lead"];

        return (
          <div
            key={col.id}
            className="w-[285px] shrink-0 snap-start flex flex-col rounded-3xl border border-border/80 bg-surface-muted/30 p-3.5"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between px-1.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold border",
                    meta.bg,
                    meta.text,
                    meta.border
                  )}
                >
                  {items.length}
                </span>
                {onAddContactToStatus && (
                  <button
                    onClick={() => onAddContactToStatus(col.id)}
                    className="rounded-lg p-1 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
                    title={`Add contact to ${col.label}`}
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 min-h-[160px]">
              {items.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ y: -2 }}
                  className="group relative cursor-grab rounded-2xl border border-border bg-surface p-4 shadow-soft transition-all hover:border-border-strong hover:shadow-card active:cursor-grabbing"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={contact.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-ink group-hover:text-accent-600 transition-colors">
                          {contact.name}
                        </p>
                        <p className="truncate text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <Building size={11} className="shrink-0" />
                          <span>{contact.company || contact.email}</span>
                        </p>
                      </div>
                    </div>

                    {contact.score ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        {contact.score} pts
                      </span>
                    ) : null}
                  </div>

                  {/* Next Step Note */}
                  {contact.nextStep && (
                    <div className="mt-3 rounded-xl bg-canvas p-2.5 text-[11.5px] text-ink-soft leading-relaxed border border-border/50">
                      <span className="font-semibold text-ink-muted text-[10px] uppercase block mb-0.5">
                        Next Action
                      </span>
                      {contact.nextStep}
                    </div>
                  )}

                  {contact.status === "Replied" && (
                    <div className="mt-3">
                      <a
                        href="/automation-builder"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Sparkles size={12} /> Post-Reply Continuation &rarr;
                      </a>
                    </div>
                  )}

                  {/* Card Footer Status Move Dropdown */}
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
                    <span className="text-ink-muted flex items-center gap-1">
                      {contact.lastTouch || "Recently"}
                    </span>

                    {onStatusChange && (
                      <select
                        value={contact.status}
                        onChange={(e) => onStatusChange(contact.id, e.target.value as ContactStatus)}
                        className="rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-soft cursor-pointer hover:border-border-strong outline-none"
                      >
                        {kanbanColumns.map((c) => (
                          <option key={c.id} value={c.id}>
                            Move to {c.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </motion.div>
              ))}

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface/50 py-10 px-4 text-center">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                    <User size={14} />
                  </div>
                  <p className="text-xs font-medium text-ink-muted">No contacts in {col.label}</p>
                  <p className="mt-0.5 text-[10px] text-ink-muted/70">
                    Leads will appear here as they move through your pipeline.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(KanbanBoard);
