"use client";

import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  PlayCircle,
  OctagonX,
  Search,
  CheckCircle2,
  Clock,
  Reply,
  Calendar,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Building,
  Layers,
  RefreshCw,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Save,
  Mail,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ProfileModal from "@/components/dashboard/ProfileModal";
import EmailAccountsModal from "@/components/dashboard/EmailAccountsModal";
import { api } from "@/lib/api";
import { cn, formatDisplayDateTime } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

interface TaskItem {
  id: string;
  title: string;
  subjectLine?: string;
  subject?: string;
  aiGeneratedContent?: string;
  suggestedDate: string;
  status: string;
}

interface SequenceLead {
  id: string;
  name: string;
  email: string;
  company: string;
  channel: string;
  stage: string;
  status: "ACTIVE" | "PENDING" | "REPLIED" | "STOPPED" | "COMPLETED";
  currentStep: number;
  totalSteps: number;
  nextScheduledDate: string | null;
  nextStepTitle: string;
  tasks: TaskItem[];
  emailLogs?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function SequencesPage() {
  const { isCollapsed } = useLayout();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showEmailAccountsModal, setShowEmailAccountsModal] = useState<boolean>(false);
  const [leads, setLeads] = useState<SequenceLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<{
    leadId: string;
    leadName: string;
    task: TaskItem;
  } | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editSubject, setEditSubject] = useState<string>("");
  const [editBody, setEditBody] = useState<string>("");
  const [savingTask, setSavingTask] = useState<boolean>(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.sequences.getLeads("all");
      setLeads(data);
    } catch (err) {
      console.warn("Failed to fetch sequence leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStopLead = async (leadId: string, leadName: string) => {
    setActionLoadingId(leadId);
    try {
      await api.sequences.stopLead(leadId);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: "STOPPED",
                stage: "STOPPED",
              }
            : l
        )
      );
      setActionToast(`🛑 Follow-ups stopped for ${leadName}.`);
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to stop sequence for lead:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResumeLead = async (leadId: string, leadName: string) => {
    setActionLoadingId(leadId);
    try {
      await api.sequences.resumeLead(leadId);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: "ACTIVE",
                stage: "In Sequence",
              }
            : l
        )
      );
      setActionToast(`▶️ Follow-ups resumed for ${leadName}.`);
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to resume sequence for lead:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Task Modal
  const openEditTaskModal = (leadId: string, leadName: string, task: TaskItem) => {
    setEditingTask({ leadId, leadName, task });
    setEditTitle(task.title || "Follow-up Step");
    setEditSubject(task.subjectLine || task.subject || "");
    setEditBody(task.aiGeneratedContent || "");

    // Format local date ISO string for datetime-local input
    try {
      const d = task.suggestedDate ? new Date(task.suggestedDate) : new Date();
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditDate(localISO);
    } catch {
      setEditDate("");
    }
  };

  // Helper for quick date presets
  const applyPresetDelay = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    d.setHours(9, 0, 0, 0); // Default to 9:00 AM
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setEditDate(localISO);
  };

  // Save Task Edits & Reschedule
  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editDate) return;

    setSavingTask(true);
    try {
      const updatedDate = new Date(editDate).toISOString();
      await api.tasks.update(editingTask.task.id, {
        title: editTitle,
        suggestedDate: updatedDate,
        subjectLine: editSubject,
        aiGeneratedContent: editBody,
      });

      // Update local leads state
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== editingTask.leadId) return lead;

          const updatedTasks = lead.tasks.map((t) =>
            t.id === editingTask.task.id
              ? {
                  ...t,
                  title: editTitle,
                  suggestedDate: updatedDate,
                  subjectLine: editSubject,
                  subject: editSubject,
                  aiGeneratedContent: editBody,
                }
              : t
          );

          // Recalculate next scheduled date
          const nextPending = updatedTasks.find((t) => t.status === "PENDING");

          return {
            ...lead,
            tasks: updatedTasks,
            nextScheduledDate: nextPending ? nextPending.suggestedDate : lead.nextScheduledDate,
            nextStepTitle: nextPending ? nextPending.title : lead.nextStepTitle,
          };
        })
      );

      setActionToast(`✏️ Updated & rescheduled follow-up step "${editTitle}".`);
      setTimeout(() => setActionToast(null), 3500);
      setEditingTask(null);
    } catch (err: any) {
      console.error("Failed to save task update:", err);
    } finally {
      setSavingTask(false);
    }
  };

  // Cancel an Individual Step
  const handleCancelTask = async (leadId: string, taskId: string, taskTitle: string) => {
    setActionLoadingId(taskId);
    try {
      await api.tasks.update(taskId, { status: "CANCELLED" });

      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;

          const updatedTasks = lead.tasks.map((t) =>
            t.id === taskId ? { ...t, status: "CANCELLED" } : t
          );

          const nextPending = updatedTasks.find((t) => t.status === "PENDING");

          return {
            ...lead,
            tasks: updatedTasks,
            nextScheduledDate: nextPending ? nextPending.suggestedDate : null,
            nextStepTitle: nextPending ? nextPending.title : "No pending steps",
          };
        })
      );

      setActionToast(`🚫 Cancelled step "${taskTitle}".`);
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to cancel task step:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reactivate a Cancelled Step
  const handleReactivateTask = async (leadId: string, taskId: string, taskTitle: string) => {
    setActionLoadingId(taskId);
    try {
      await api.tasks.update(taskId, { status: "PENDING" });

      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;

          const updatedTasks = lead.tasks.map((t) =>
            t.id === taskId ? { ...t, status: "PENDING" } : t
          );

          const nextPending = updatedTasks.find((t) => t.status === "PENDING");

          return {
            ...lead,
            tasks: updatedTasks,
            nextScheduledDate: nextPending ? nextPending.suggestedDate : lead.nextScheduledDate,
            nextStepTitle: nextPending ? nextPending.title : lead.nextStepTitle,
          };
        })
      );

      setActionToast(`🔄 Reactivated follow-up step "${taskTitle}".`);
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to reactivate task step:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      l.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalLeadsCount = leads.length;
  const activeLeadsCount = leads.filter((l) => l.status === "ACTIVE" || l.status === "PENDING").length;
  const stoppedLeadsCount = leads.filter((l) => l.status === "STOPPED").length;
  const repliedLeadsCount = leads.filter((l) => l.status === "REPLIED").length;

  const minDateTimeISO = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenEmailAccounts={() => setShowEmailAccountsModal(true)}
      />
      <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <Topbar
          title="Sequence Management & Lead Tracking"
          subtitle="Real-time transparency into enrolled leads, scheduled follow-up steps, and manual stop controls."
          onOpenProfile={() => setShowProfileModal(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Action Feedback Toast */}
          <AnimatePresence>
            {actionToast && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-6 flex items-center justify-between rounded-xl border border-accent-300 bg-accent-50 p-4 shadow-md text-xs font-bold text-accent-950"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent-600" />
                  <span>{actionToast}</span>
                </div>
                <button
                  onClick={() => setActionToast(null)}
                  className="text-xs text-accent-700 hover:text-accent-900 underline"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top KPI Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="card p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Total Enrolled</p>
                <h3 className="text-2xl font-black text-ink mt-1">{totalLeadsCount}</h3>
                <p className="text-[11px] text-ink-soft mt-0.5">Leads across sequences</p>
              </div>
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 border border-accent-100 shrink-0">
                <Users size={20} />
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Active Sequences</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeLeadsCount}</h3>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Automated dispatch active</p>
              </div>
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <Clock size={20} />
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Customer Replied</p>
                <h3 className="text-2xl font-black text-purple-600 mt-1">{repliedLeadsCount}</h3>
                <p className="text-[11px] text-purple-700 font-medium mt-0.5">Follow-ups auto-halted</p>
              </div>
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                <Reply size={20} />
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Manually Stopped</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">{stoppedLeadsCount}</h3>
                <p className="text-[11px] text-rose-700 font-medium mt-0.5">Protected from dispatch</p>
              </div>
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <OctagonX size={20} />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="card mb-6 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search lead by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 py-2 text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0 hidden sm:inline">Status:</span>
                <div className="flex rounded-xl border border-border bg-surface-muted/60 p-1 shrink-0">
                  {["ALL", "ACTIVE", "REPLIED", "STOPPED", "COMPLETED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={cn(
                        "px-2.5 sm:px-3 py-1.5 text-[10.5px] sm:text-[11px] font-bold rounded-lg transition-all shrink-0",
                        statusFilter === st
                          ? "bg-surface text-ink shadow-xs border border-border"
                          : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchLeads}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 font-bold shrink-0 ml-auto md:ml-0"
                title="Refresh Lead Table"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Main Lead Tracking View (Mobile Cards < md & Desktop Table >= md) */}
          <div className="card overflow-hidden shadow-soft">
            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className="block md:hidden divide-y divide-border/60">
              {loading ? (
                <div className="p-8 text-center text-ink-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin text-accent-600" />
                    <span className="font-semibold text-xs">Loading sequence lead status...</span>
                  </div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                      <Users size={22} />
                    </div>
                    <p className="text-sm font-bold text-ink">No enrolled sequence leads found</p>
                    <p className="text-xs text-ink-muted">
                      Generate a sequence in Sequence Builder to enroll leads into automated follow-ups.
                    </p>
                  </div>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isExpanded = expandedLeadId === lead.id;
                  const isActioning = actionLoadingId === lead.id;

                  return (
                    <div key={lead.id} className="p-4 space-y-3.5 bg-surface">
                      {/* Lead Header Info & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700 font-bold text-xs">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-ink text-xs truncate">{lead.name}</p>
                            <p className="text-[11px] font-mono text-accent-700 truncate">{lead.email}</p>
                            {lead.company && (
                              <p className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                                <Building size={10} /> {lead.company}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {lead.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                            </span>
                          )}
                          {lead.status === "STOPPED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
                              <OctagonX size={11} className="text-rose-600" /> Stopped
                            </span>
                          )}
                          {lead.status === "REPLIED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
                              <Reply size={11} className="text-purple-600" /> Replied
                            </span>
                          )}
                          {lead.status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
                              <CheckCircle2 size={11} className="text-blue-600" /> Done
                            </span>
                          )}
                          {lead.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
                              <Clock size={11} className="text-amber-600" /> Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step Progress Bar */}
                      <div className="bg-surface-muted/50 rounded-xl p-2.5 border border-border/50 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                          <span>Step {lead.currentStep} of {lead.totalSteps}</span>
                          <span className="text-[10px] text-ink-muted">
                            {Math.round((lead.currentStep / lead.totalSteps) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden border border-border">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              lead.status === "STOPPED"
                                ? "bg-rose-500"
                                : lead.status === "REPLIED"
                                ? "bg-purple-600"
                                : "bg-accent-600"
                            )}
                            style={{
                              width: `${(lead.currentStep / lead.totalSteps) * 100}%`,
                            }}
                          />
                        </div>
                        {/* Next Scheduled */}
                        <div className="text-[10.5px] pt-1 border-t border-border/40 flex items-center justify-between">
                          <span className="text-ink-muted">Next Due:</span>
                          {lead.status === "STOPPED" ? (
                            <span className="text-rose-600 font-semibold">Halted</span>
                          ) : lead.status === "REPLIED" ? (
                            <span className="text-purple-700 font-semibold">Paused (Replied)</span>
                          ) : lead.nextScheduledDate ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatDisplayDateTime(lead.nextScheduledDate)}
                            </span>
                          ) : (
                            <span className="text-ink-muted">Completed</span>
                          )}
                        </div>
                      </div>

                      {/* Mobile Card Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          className="flex items-center gap-1 text-xs font-bold text-accent-700 hover:underline"
                        >
                          <ChevronRight
                            size={14}
                            className={cn("transition-transform", isExpanded && "rotate-90")}
                          />
                          <span>{isExpanded ? "Hide Steps" : "View / Edit Steps"}</span>
                        </button>

                        {isActioning ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted font-semibold">
                            <Loader2 size={13} className="animate-spin text-accent-600" /> Updating...
                          </span>
                        ) : lead.status === "STOPPED" ? (
                          <button
                            onClick={() => handleResumeLead(lead.id, lead.name)}
                            className="btn-secondary py-1 px-2.5 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                          >
                            <PlayCircle size={13} className="text-emerald-600" /> Resume
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStopLead(lead.id, lead.name)}
                            className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                          >
                            <OctagonX size={13} className="text-rose-600" /> Stop
                          </button>
                        )}
                      </div>

                      {/* Mobile Expanded Step Drawer */}
                      {isExpanded && (
                        <div className="mt-3 rounded-2xl border border-border bg-canvas/40 p-3.5 space-y-4 text-xs">
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <h4 className="font-bold text-ink uppercase text-[10.5px] tracking-wider flex items-center gap-1.5">
                              <Layers size={14} className="text-accent-600" /> Sequence Steps ({lead.tasks.length})
                            </h4>
                          </div>

                          <div className="space-y-2.5">
                            {lead.tasks.map((task, idx) => {
                              const isTaskActioning = actionLoadingId === task.id;
                              return (
                                <div
                                  key={task.id}
                                  className="rounded-xl border border-border bg-surface p-3 space-y-2 shadow-2xs"
                                >
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="flex h-5 w-5 items-center justify-center rounded bg-ink text-white font-bold text-[9.5px]">
                                        #{idx + 1}
                                      </span>
                                      <span
                                        className={cn(
                                          "rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase",
                                          task.status === "SENT"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : task.status === "CANCELLED"
                                            ? "bg-rose-100 text-rose-800"
                                            : "bg-amber-100 text-amber-800"
                                        )}
                                      >
                                        {task.status}
                                      </span>
                                    </div>

                                    <p className="font-bold text-ink text-xs">{task.title}</p>
                                    <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-muted font-mono">
                                      <Calendar size={10} className="text-accent-600" />
                                      {formatDisplayDateTime(task.suggestedDate)}
                                    </span>
                                  </div>

                                  {/* Mobile Task Actions */}
                                  <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-end gap-1.5">
                                    {isTaskActioning ? (
                                      <Loader2 size={13} className="animate-spin text-accent-600" />
                                    ) : task.status === "SENT" ? (
                                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                        <CheckCircle2 size={11} /> Delivered
                                      </span>
                                    ) : task.status === "CANCELLED" ? (
                                      <button
                                        onClick={() => handleReactivateTask(lead.id, task.id, task.title)}
                                        className="btn-secondary py-1 px-2 text-[10.5px] font-bold flex items-center gap-1"
                                      >
                                        <RotateCcw size={10} /> Reactivate
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => openEditTaskModal(lead.id, lead.name, task)}
                                          className="rounded-lg border border-accent-200 bg-accent-50 text-accent-800 px-2 py-1 text-[10.5px] font-bold flex items-center gap-1"
                                        >
                                          <Pencil size={10} /> Edit &amp; Reschedule
                                        </button>
                                        <button
                                          onClick={() => handleCancelTask(lead.id, task.id, task.title)}
                                          className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-2 py-1 text-[10.5px] font-bold flex items-center gap-1"
                                        >
                                          <Trash2 size={10} /> Cancel
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. DESKTOP TABLE VIEW (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <th className="px-5 py-3.5">Enrolled Lead</th>
                    <th className="px-4 py-3.5">Status &amp; Guardrail</th>
                    <th className="px-4 py-3.5">Step Progress</th>
                    <th className="px-4 py-3.5">Next Scheduled Follow-up</th>
                    <th className="px-5 py-3.5 text-right">Manual Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-ink-muted">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin text-accent-600" />
                          <span className="font-semibold text-xs">Loading sequence lead status...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                            <Users size={22} />
                          </div>
                          <p className="text-sm font-bold text-ink">No enrolled sequence leads found</p>
                          <p className="text-xs text-ink-muted">
                            Generate a sequence in Sequence Builder to enroll leads into automated follow-ups.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const isExpanded = expandedLeadId === lead.id;
                      const isActioning = actionLoadingId === lead.id;

                      return (
                        <Fragment key={lead.id}>
                          <tr
                            className={cn(
                              "transition-colors hover:bg-surface-muted/30 cursor-pointer",
                              isExpanded && "bg-accent-50/20"
                            )}
                            onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          >
                            {/* Lead Info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700 font-bold text-xs">
                                  {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-ink text-xs hover:text-accent-600 transition-colors">
                                      {lead.name}
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className={cn(
                                        "text-ink-muted transition-transform",
                                        isExpanded && "rotate-90 text-accent-600"
                                      )}
                                    />
                                  </div>
                                  <p className="text-[11px] font-mono text-accent-700 truncate">{lead.email}</p>
                                  <p className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                                    <Building size={10} /> {lead.company}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="px-4 py-4">
                              {lead.status === "ACTIVE" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 text-[10.5px] font-extrabold shadow-2xs">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Sequence
                                </span>
                              )}
                              {lead.status === "STOPPED" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 text-[10.5px] font-extrabold shadow-2xs">
                                  <OctagonX size={12} className="text-rose-600" /> Manually Stopped
                                </span>
                              )}
                              {lead.status === "REPLIED" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 text-[10.5px] font-extrabold shadow-2xs">
                                  <Reply size={12} className="text-purple-600" /> Customer Replied
                                </span>
                              )}
                              {lead.status === "COMPLETED" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 text-[10.5px] font-extrabold shadow-2xs">
                                  <CheckCircle2 size={12} className="text-blue-600" /> Completed
                                </span>
                              )}
                              {lead.status === "PENDING" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 text-[10.5px] font-extrabold shadow-2xs">
                                  <Clock size={12} className="text-amber-600" /> Pending Start
                                </span>
                              )}
                            </td>

                            {/* Step Progress */}
                            <td className="px-4 py-4">
                              <div className="w-36">
                                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                                  <span>Step {lead.currentStep} of {lead.totalSteps}</span>
                                  <span className="text-[10px] text-ink-muted">
                                    {Math.round((lead.currentStep / lead.totalSteps) * 100)}%
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden border border-border">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      lead.status === "STOPPED"
                                        ? "bg-rose-500"
                                        : lead.status === "REPLIED"
                                        ? "bg-purple-600"
                                        : "bg-accent-600"
                                    )}
                                    style={{
                                      width: `${(lead.currentStep / lead.totalSteps) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Next Scheduled Follow-up */}
                            <td className="px-4 py-4">
                              {lead.status === "STOPPED" ? (
                                <span className="text-rose-600 text-xs font-semibold">
                                  Follow-ups Halted
                                </span>
                              ) : lead.status === "REPLIED" ? (
                                <span className="text-purple-700 text-xs font-semibold">
                                  Sequence Paused (Replied)
                                </span>
                              ) : lead.nextScheduledDate ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <Calendar size={12} className="text-emerald-600" />
                                    {formatDisplayDateTime(lead.nextScheduledDate)}
                                  </span>
                                  <p className="text-[10.5px] text-ink-muted truncate max-w-[180px] mt-0.5">
                                    {lead.nextStepTitle}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-ink-muted text-xs">All steps completed</span>
                              )}
                            </td>

                            {/* Action Controls */}
                            <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              {isActioning ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted font-semibold">
                                  <Loader2 size={14} className="animate-spin text-accent-600" /> Updating...
                                </span>
                              ) : lead.status === "STOPPED" ? (
                                <button
                                  onClick={() => handleResumeLead(lead.id, lead.name)}
                                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors ml-auto shadow-xs"
                                  title="Resume automated follow-ups for this lead"
                                >
                                  <PlayCircle size={14} className="text-emerald-600" /> Resume Sequence
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStopLead(lead.id, lead.name)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto shadow-2xs"
                                  title="Manually stop and terminate all future follow-up emails for this lead"
                                >
                                  <OctagonX size={14} className="text-rose-600" /> Stop Follow-ups
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Step Timeline & Editing Drawer */}
                          {isExpanded && (
                            <tr className="bg-canvas/50">
                              <td colSpan={5} className="p-5 border-b border-border">
                                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-5">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                                    <div className="flex items-center gap-2">
                                      <Layers size={16} className="text-accent-600" />
                                      <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                                        Sequence Step Management &amp; Timeline — {lead.name}
                                      </h4>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50/80 border border-accent-200/50 px-2.5 py-1 text-[11px] font-semibold text-accent-700 self-start sm:self-auto">
                                      <Mail size={12} className="text-accent-600" /> {lead.email}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                    {/* Scheduled Steps & Action Controls */}
                                    <div className="lg:col-span-7 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                                          Scheduled Follow-up Steps ({lead.tasks.length})
                                        </h5>
                                        <span className="text-[11px] text-ink-muted font-medium hidden sm:inline">
                                          Click &quot;Edit &amp; Reschedule&quot; to change date, subject or body content
                                        </span>
                                      </div>

                                      <div className="space-y-3">
                                        {lead.tasks.map((task, idx) => {
                                          const isTaskActioning = actionLoadingId === task.id;

                                          return (
                                            <div
                                              key={task.id}
                                              className="rounded-xl border border-border bg-canvas/60 p-3.5 text-xs shadow-2xs space-y-2"
                                            >
                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-white font-bold text-[10px] shrink-0">
                                                    #{idx + 1}
                                                  </span>
                                                  <div>
                                                    <p className="font-bold text-ink text-xs">{task.title}</p>
                                                    <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                                                      <span className="inline-flex items-center gap-1 font-mono font-medium">
                                                        <Calendar size={11} className="text-accent-600" />
                                                        {formatDisplayDateTime(task.suggestedDate)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span
                                                    className={cn(
                                                      "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase",
                                                      task.status === "SENT"
                                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                        : task.status === "CANCELLED"
                                                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                                                        : "bg-amber-100 text-amber-800 border border-amber-300"
                                                    )}
                                                  >
                                                    {task.status}
                                                  </span>

                                                  {/* Task Controls: Edit, Cancel, Reactivate */}
                                                  {isTaskActioning ? (
                                                    <Loader2 size={14} className="animate-spin text-accent-600" />
                                                  ) : task.status === "SENT" ? (
                                                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                                      <CheckCircle2 size={12} /> Delivered
                                                    </span>
                                                  ) : task.status === "CANCELLED" ? (
                                                    <button
                                                      onClick={() =>
                                                        handleReactivateTask(lead.id, task.id, task.title)
                                                      }
                                                      className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                      title="Reactivate this cancelled step back to pending"
                                                    >
                                                      <RotateCcw size={11} /> Reactivate
                                                    </button>
                                                  ) : (
                                                    <div className="flex items-center gap-1">
                                                      <button
                                                        onClick={() =>
                                                          openEditTaskModal(lead.id, lead.name, task)
                                                        }
                                                        className="flex items-center gap-1 rounded-lg border border-accent-200 bg-accent-50 text-accent-800 hover:bg-accent-100 px-2.5 py-1 text-[11px] font-bold transition-colors shadow-2xs"
                                                        title="Edit date, time, subject line or content for this step"
                                                      >
                                                        <Pencil size={11} /> Edit &amp; Reschedule
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleCancelTask(lead.id, task.id, task.title)
                                                        }
                                                        className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 text-[11px] font-bold transition-colors"
                                                        title="Cancel this specific step"
                                                      >
                                                        <Trash2 size={11} /> Cancel
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Preview Content */}
                                              {(task.subjectLine || task.subject || task.aiGeneratedContent) && (
                                                <div className="rounded-lg bg-surface p-2.5 border border-border/80 text-[11px]">
                                                  <p className="font-bold text-ink truncate">
                                                    Subject: {task.subjectLine || task.subject || "No subject set"}
                                                  </p>
                                                  {task.aiGeneratedContent && (
                                                    <p className="text-ink-soft line-clamp-2 mt-1">
                                                      {task.aiGeneratedContent}
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Email Dispatch Audit Logs */}
                                    <div className="lg:col-span-5 space-y-3">
                                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                                        Email Dispatch Audit Logs ({lead.emailLogs?.length || 0})
                                      </h5>
                                      {lead.emailLogs && lead.emailLogs.length > 0 ? (
                                        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                          {lead.emailLogs.map((log: any) => (
                                            <div
                                              key={log.id}
                                              className="rounded-xl border border-border bg-canvas/60 p-3 text-xs space-y-1"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="font-bold text-accent-700 truncate max-w-[200px]">
                                                  {log.subject}
                                                </span>
                                                <span className="text-[10px] text-ink-muted font-mono shrink-0">
                                                  {formatDisplayDateTime(log.createdAt)}
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-ink-soft line-clamp-2">
                                                {log.bodyContent}
                                              </p>
                                              <div className="flex items-center justify-between text-[9.5px] font-semibold text-ink-muted pt-1">
                                                <span>From: {log.sender || "System Dispatcher"}</span>
                                                <span
                                                  className={cn(
                                                    "font-bold uppercase",
                                                    log.status === "SENT" ? "text-emerald-600" : "text-rose-600"
                                                  )}
                                                >
                                                  {log.status}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-muted bg-surface/50">
                                          <Mail size={24} className="mx-auto mb-2 text-ink-muted opacity-60" />
                                          No email logs recorded yet. Once scheduled steps execute, delivery audits will appear here.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT STEP & SCHEDULE MODAL */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Edit Step Schedule &amp; Content</h3>
                    <p className="text-[11px] text-ink-muted">
                      Lead: <span className="font-semibold text-ink">{editingTask.leadName}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTaskEdit} className="space-y-4">
                {/* Step Title */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Step Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="input-field py-2 text-xs font-medium"
                    placeholder="e.g. Meeting Follow-up"
                  />
                </div>

                {/* Schedule Date & Time Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-ink flex items-center gap-1">
                      <Calendar size={13} className="text-accent-600" />
                      Scheduled Dispatch Date &amp; Time
                    </label>
                    <span className="text-[10px] text-ink-muted font-medium">Local Timezone</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="block text-[10px] font-bold text-ink-muted mb-1">Target Date</span>
                      <input
                        type="date"
                        value={editDate ? editDate.slice(0, 10) : ""}
                        onChange={(e) => {
                          const timePart = editDate ? editDate.slice(11, 16) : "09:00";
                          setEditDate(`${e.target.value || new Date().toISOString().slice(0, 10)}T${timePart}`);
                        }}
                        min={new Date().toISOString().slice(0, 10)}
                        required
                        className="input-field py-2 text-xs font-semibold bg-surface cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-ink-muted mb-1">Exact Dispatch Time</span>
                      <input
                        type="time"
                        value={editDate ? editDate.slice(11, 16) : "09:00"}
                        onChange={(e) => {
                          const datePart = editDate ? editDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
                          setEditDate(`${datePart}T${e.target.value || "09:00"}`);
                        }}
                        required
                        className="input-field py-2 text-xs font-semibold bg-surface cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Preset Delay Quick-Buttons */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-ink-muted uppercase mr-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyPresetDelay(1)}
                      className="rounded-md border border-accent-200 bg-accent-50/60 px-2 py-1 text-[10.5px] font-bold text-accent-800 hover:bg-accent-100 transition-colors shadow-2xs"
                    >
                      Tomorrow (9:00 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDelay(3)}
                      className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[10.5px] font-bold text-ink hover:bg-accent-50 hover:border-accent-200 transition-colors"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDelay(7)}
                      className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[10.5px] font-bold text-ink hover:bg-accent-50 hover:border-accent-200 transition-colors"
                    >
                      +7 Days (Next Week)
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                    className="input-field py-2 text-xs font-medium"
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Email Body Content */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Email Body Content</label>
                  <textarea
                    rows={4}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="input-field py-2 text-xs font-medium resize-y"
                    placeholder="Write or fine-tune your follow-up email body..."
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTask}
                    className="btn-accent text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    {savingTask ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save &amp; Reschedule Step
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <EmailAccountsModal
        isOpen={showEmailAccountsModal}
        onClose={() => setShowEmailAccountsModal(false)}
      />
    </div>
  );
}
