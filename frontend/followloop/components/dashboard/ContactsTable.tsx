import React, { memo } from "react";
import { motion } from "framer-motion";
import { Trash2, UserPlus, Users, MessageSquare } from "lucide-react";
import { Contact, statusStyles } from "@/lib/data";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface ContactsTableProps {
  contacts: Contact[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: any) => void;
  onAddContact?: () => void;
  onSelectContact?: (id: string) => void;
}

function ContactsTable({
  contacts = [],
  onDelete,
  onStatusChange,
  onAddContact,
  onSelectContact,
}: ContactsTableProps) {
  // Clean up legacy test entries like "HR Department" or "HR"
  const validContacts = contacts.filter(
    (c) => c && c.name && c.name !== "HR Department" && c.name !== "HR"
  );

  if (!validContacts || validContacts.length === 0) {
    return (
      <div className="card p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 mb-4 shadow-soft">
          <Users size={22} />
        </div>
        <h3 className="text-base font-bold text-ink mb-1">No contacts in your pipeline yet</h3>
        <p className="text-xs text-ink-muted max-w-sm mb-6 leading-relaxed">
          Create your first contact or use Sequence Builder to generate AI follow-ups from interaction notes.
        </p>
        {onAddContact && (
          <button
            onClick={onAddContact}
            className="btn-accent px-4 py-2 text-xs flex items-center gap-2 shadow-soft"
          >
            <UserPlus size={14} /> Add First Contact
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Next step</th>
              <th className="px-5 py-3.5">Last touch</th>
              <th className="px-5 py-3.5">Score</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {validContacts.map((contact, i) => (
              <motion.tr
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface-muted/40 group cursor-pointer"
                onClick={() => onSelectContact && onSelectContact(contact.id)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={contact.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink group-hover:text-accent-600 transition-colors">
                        {contact.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">{contact.company || contact.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={contact.status}
                    onChange={(e) => onStatusChange && onStatusChange(contact.id, e.target.value)}
                    className={cn(
                      "pill border text-[11px] font-medium bg-transparent cursor-pointer outline-none focus:ring-1 focus:ring-accent-500",
                      statusStyles[contact.status] || "bg-slate-100 text-slate-700"
                    )}
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="In Sequence">In Sequence</option>
                    <option value="Awaiting Reply">Awaiting Reply</option>
                    <option value="Replied">Replied</option>
                    <option value="Booked">Booked</option>
                    <option value="Stalled">Stalled</option>
                  </select>
                </td>
                <td className="px-5 py-3.5 text-sm text-ink-soft">{contact.nextStep || "—"}</td>
                <td className="px-5 py-3.5 text-sm text-ink-muted">{contact.lastTouch || "Just now"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          (contact.score || 50) > 70
                            ? "bg-emerald-500"
                            : (contact.score || 50) > 40
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        )}
                        style={{ width: `${contact.score || 50}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-ink-muted">{contact.score || 50}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectContact && onSelectContact(contact.id)}
                      title="View Lead Thread & Timeline"
                      className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-50 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <MessageSquare size={15} /> Unibox
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(contact.id)}
                        title="Delete Contact"
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ContactsTable);
