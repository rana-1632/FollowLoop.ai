"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Reply,
  Mail,
  CheckCircle2,
  RefreshCw,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api, formatErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

interface LogItem {
  id: string;
  sender?: string;
  recipient: string;
  subject: string;
  direction: "OUTBOUND" | "INBOUND";
  status: string;
  time: string;
  contactName?: string;
}

interface DeliveryLogTableProps {
  logs?: any[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function DeliveryLogTable({
  logs: propLogs,
  loading: propLoading,
  onRefresh,
}: DeliveryLogTableProps) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(propLoading ?? true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirm Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "selected" | "all" | null;
    targetId?: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: null,
    title: "",
    description: "",
  });

  // Inbound Webhook Simulator Modal state
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [senderEmail, setSenderEmail] = useState("ahmed@grandluxe.com");
  const [replyText, setReplyText] = useState(
    "Hi! Yes, we reviewed the venue walkthrough quote and would like to confirm our booking."
  );
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  const formatRawLogs = (raw: any[]): LogItem[] => {
    return raw.map((l: any, i: number) => ({
      id: l.id || `d_${i}`,
      sender: l.sender || "System",
      recipient: l.contact?.name
        ? `${l.contact.name} (${l.recipientEmail || l.recipient})`
        : l.recipientEmail || l.recipient,
      contactName: l.contact?.name || l.recipientEmail || l.recipient,
      subject: l.subject || "Follow-up message",
      direction:
        (l.direction as any) ||
        (l.status === "REPLIED" || l.status === "RECEIVED"
          ? "INBOUND"
          : "OUTBOUND"),
      status: l.status || "SENT",
      time: l.createdAt
        ? new Date(l.createdAt).toLocaleString()
        : "Recently",
    }));
  };

  const fetchLogs = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    try {
      setLoading(true);
      const liveLogs = await api.analytics.getLogs();
      if (Array.isArray(liveLogs) && liveLogs.length > 0) {
        setLogs(formatRawLogs(liveLogs));
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn("Could not fetch delivery logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    if (propLogs !== undefined) {
      setLoading(propLoading ?? false);
      if (Array.isArray(propLogs)) {
        setLogs(formatRawLogs(propLogs));
      } else {
        setLogs([]);
      }
      return;
    }
    fetchLogs();
  }, [propLogs, propLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selection Logic
  const isAllSelected = logs.length > 0 && selectedIds.length === logs.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map((l) => l.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Prompt Individual Delete Modal
  const promptDeleteSingle = (logId: string) => {
    const target = logs.find((l) => l.id === logId);
    setDeleteModal({
      isOpen: true,
      type: "single",
      targetId: logId,
      title: "Delete Email Log Entry",
      description: `Are you sure you want to delete the email audit log for "${
        target?.recipient || "this contact"
      }"? This action cannot be undone.`,
    });
  };

  // Prompt Bulk Selected Delete Modal
  const promptDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: "selected",
      title: `Delete ${selectedIds.length} Selected Email Logs`,
      description: `Are you sure you want to permanently delete the ${selectedIds.length} selected email audit log entries?`,
    });
  };

  // Prompt Clear All Logs Modal
  const promptClearAllLogs = () => {
    if (logs.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "Clear Entire Email Audit Log",
      description:
        "Are you sure you want to delete ALL email dispatch and inbound reply logs? This action is permanent and cannot be undone.",
    });
  };

  // Execute Deletion after User Confirmation in Modal
  const handleExecuteDelete = async () => {
    setActionLoading(true);
    try {
      if (deleteModal.type === "single" && deleteModal.targetId) {
        await api.analytics.deleteLog(deleteModal.targetId);
        setLogs((prev) => prev.filter((l) => l.id !== deleteModal.targetId));
        setSelectedIds((prev) => prev.filter((i) => i !== deleteModal.targetId));
        showToast("🗑️ Log entry deleted successfully.");
      } else if (deleteModal.type === "selected") {
        await api.analytics.bulkDeleteLogs(selectedIds);
        setLogs((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
        showToast(`🗑️ Deleted ${selectedIds.length} log entries.`);
        setSelectedIds([]);
      } else if (deleteModal.type === "all") {
        await api.analytics.bulkDeleteLogs();
        setLogs([]);
        setSelectedIds([]);
        showToast("🧹 All email audit logs cleared successfully.");
      }
    } catch (err: any) {
      showToast(`❌ Error: ${formatErrorMessage(err)}`);
    } finally {
      setActionLoading(false);
      setDeleteModal({ isOpen: false, type: null, title: "", description: "" });
    }
  };

  const handleSimulateInboundReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await api.emailAccounts.triggerInboundWebhook({
        from: senderEmail.trim(),
        to: "outreach@followloop.ai",
        subject: "Re: Following up on our recent conversation",
        text: replyText.trim(),
      });

      if (res && res.matched) {
        setWebhookResult(
          `Successfully matched contact "${res.contactName}"! Pipeline stage transitioned to REPLIED.`
        );
      } else {
        setWebhookResult(
          `Inbound webhook received. Note: No existing contact with email "${senderEmail}" was found.`
        );
      }

      await fetchLogs();
    } catch (err: any) {
      setWebhookResult(`Inbound Webhook Error: ${formatErrorMessage(err)}`);
    } finally {
      setSendingWebhook(false);
    }
  };

  return (
    <div className="card overflow-hidden relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 right-4 z-40 bg-ink text-canvas text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border px-6 py-4 gap-3 bg-surface">
        <div>
          <h3 className="text-sm font-bold text-ink">
            Delivery &amp; Inbound Reply Audit Log
          </h3>
          <p className="text-xs text-ink-muted">
            Real-time email dispatches, user sending identities &amp; reply tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={promptClearAllLogs}
              disabled={actionLoading}
              className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Delete all email logs from the system"
            >
              <Trash2 size={13} className="text-rose-600" /> Clear All Logs
            </button>
          )}

          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
          <button
            onClick={() => setShowWebhookModal(true)}
            className="btn-accent py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <Reply size={13} /> Test Inbound Reply Webhook
          </button>
        </div>
      </div>

      {/* Bulk Action Sub-Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-accent-50/80 border-b border-accent-200 px-6 py-2.5 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-white text-[11px]">
              {selectedIds.length}
            </span>
            <span>
              {selectedIds.length === 1
                ? "1 email log selected"
                : `${selectedIds.length} email logs selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-ink-muted hover:text-ink px-2 py-1 transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={promptDeleteSelected}
              disabled={actionLoading}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 size={13} />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-accent-600" />
          <span>Loading audit logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-sm text-ink-muted space-y-2">
          <AlertCircle size={28} className="mx-auto text-ink-muted/50" />
          <p className="font-bold text-ink">No email audit logs found</p>
          <p className="text-xs text-ink-muted">
            Dispatch an email or simulate an inbound reply to view logs!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-ink-muted bg-surface-muted/30">
                <th className="px-4 py-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-ink-muted hover:text-ink transition-colors flex items-center justify-center mx-auto"
                    title={isAllSelected ? "Deselect All" : "Select All Logs"}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-accent-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3">Direction</th>
                <th className="px-5 py-3">Target / Contact</th>
                <th className="px-5 py-3">Subject Line</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const isSelected = selectedIds.includes(log.id);

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className={cn(
                      "border-b border-border text-xs last:border-0 transition-colors",
                      isSelected
                        ? "bg-accent-50/40"
                        : "hover:bg-surface-muted/40"
                    )}
                  >
                    {/* Checkbox Column */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleSelectOne(log.id)}
                        className="text-ink-muted hover:text-ink transition-colors flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-accent-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    {/* Direction */}
                    <td className="px-5 py-3.5">
                      {log.direction === "INBOUND" ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <Reply size={11} /> INBOUND
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <Send size={11} /> OUTBOUND
                        </span>
                      )}
                    </td>

                    {/* Target / Contact */}
                    <td className="px-5 py-3.5 font-semibold text-ink max-w-[220px] truncate">
                      {log.recipient}
                    </td>

                    {/* Subject Line */}
                    <td className="max-w-[260px] truncate px-5 py-3.5 text-ink-muted font-medium">
                      {log.subject}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {log.status === "REPLIED" || log.status === "RECEIVED" ? (
                        <span className="pill text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {log.status}
                        </span>
                      ) : log.status === "FAILED" ? (
                        <span className="pill text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          FAILED
                        </span>
                      ) : (
                        <span className="pill text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          {log.status}
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-ink-muted whitespace-nowrap font-medium">
                      {log.time}
                    </td>

                    {/* Individual Delete Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => promptDeleteSingle(log.id)}
                        disabled={actionLoading}
                        className="rounded-lg p-1.5 text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="Delete this log entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reusable Branded Delete Verification Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteDelete}
        title={deleteModal.title}
        description={deleteModal.description}
        confirmText="Confirm Delete"
        loading={actionLoading}
      />

      {/* Inbound Reply Webhook Test Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md card p-6 bg-surface shadow-2xl relative border border-border rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <Reply size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Inbound Email Reply Webhook Simulator
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Simulate an incoming customer email reply to test automatic
                  thread matching &amp; stage transition
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateInboundReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Lead Sender Email Address
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. ahmed@grandluxe.com"
                  className="input-field text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Incoming Reply Message Body
                </label>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="input-field text-xs font-medium resize-none"
                />
              </div>

              {webhookResult && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
                  <p className="font-semibold">Webhook Response:</p>
                  <p className="mt-0.5">{webhookResult}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="btn-secondary flex-1 py-2 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingWebhook}
                  className="btn-accent flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {sendingWebhook ? "Processing..." : "Trigger Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
