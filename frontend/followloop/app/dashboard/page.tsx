"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ListChecks,
  LayoutGrid as GridIcon,
  Mail,
  Users,
  TrendingUp,
  Timer,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import MetricCard from "@/components/dashboard/MetricCard";
import ContactsTable from "@/components/dashboard/ContactsTable";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProfileModal from "@/components/dashboard/ProfileModal";
import EmailAccountsModal from "@/components/dashboard/EmailAccountsModal";
import OnboardingBanner from "@/components/dashboard/OnboardingBanner";
import ReplyNotificationBanner from "@/components/dashboard/ReplyNotificationBanner";
import { Contact, ContactStatus } from "@/lib/data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

export default function DashboardPage() {
  const { isCollapsed } = useLayout();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Modal & Email Accounts Modal & New Contact Modal State
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showEmailAccountsModal, setShowEmailAccountsModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    email: "",
    status: "New Lead" as ContactStatus,
    nextStep: "Sequence starts soon",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch real data from NestJS Backend API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [contactsData, tasksData, logsData] = await Promise.allSettled([
        api.contacts.getAll(),
        api.tasks.getAll(),
        api.analytics.getLogs(),
      ]);

      if (contactsData.status === "fulfilled" && Array.isArray(contactsData.value)) {
        // Filter out legacy dummy/test entries like "HR Department"
        const cleaned = contactsData.value.filter(
          (c: any) => c && c.name && c.name !== "HR Department" && c.name !== "HR"
        );
        setContactsList(cleaned);
      } else {
        setContactsList([]);
      }

      if (tasksData.status === "fulfilled" && Array.isArray(tasksData.value)) {
        setTasksList(tasksData.value);
      } else {
        setTasksList([]);
      }

      if (logsData.status === "fulfilled" && Array.isArray(logsData.value)) {
        setEmailLogs(logsData.value);
      } else {
        setEmailLogs([]);
      }
    } catch (err) {
      console.warn("Could not fetch backend dashboard data:", err);
      setContactsList([]);
      setTasksList([]);
      setEmailLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("oauth_success") || params.get("oauth_error")) {
        setShowEmailAccountsModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    // Optimistic UI update
    setContactsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    try {
      await api.contacts.update(id, { status: newStatus });
    } catch (err) {
      console.warn("Backend update failed, keeping optimistic status:", err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    setContactsList((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.contacts.delete(id);
    } catch (err) {
      console.warn("Backend delete failed, keeping local removal:", err);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.email.trim()) return;

    setSubmitting(true);
    try {
      const created = await api.contacts.create({
        name: newContact.name,
        company: newContact.company || "Independent",
        email: newContact.email,
        status: newContact.status,
        nextStep: newContact.nextStep,
        score: Math.floor(Math.random() * 30) + 60,
      });

      setContactsList((prev) => [created, ...prev]);
    } catch (err) {
      console.warn("Backend create contact failed:", err);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setNewContact({
        name: "",
        company: "",
        email: "",
        status: "New Lead",
        nextStep: "Sequence starts soon",
      });
    }
  };

  const openAddContactModalWithStatus = (status: ContactStatus) => {
    setNewContact({
      name: "",
      company: "",
      email: "",
      status,
      nextStep: "Sequence starts soon",
    });
    setShowModal(true);
  };

  const activeSequencesCount = tasksList.filter((t) => t.status === "PENDING" || !t.status).length;
  const totalSentCount = emailLogs.length;
  const repliedContactsCount = contactsList.filter((c) => c.status === "Replied").length;
  const replyRate = contactsList.length > 0 ? `${Math.round((repliedContactsCount / contactsList.length) * 100)}%` : "0%";

  const metrics = [
    {
      label: "Active sequences",
      value: String(activeSequencesCount),
      delta: activeSequencesCount > 0 ? `+${activeSequencesCount} active` : "0 active",
      trend: "up" as const,
      icon: Timer,
    },
    {
      label: "Emails sent (30d)",
      value: String(totalSentCount),
      delta: totalSentCount > 0 ? `+${totalSentCount} total` : "0 sent",
      trend: "up" as const,
      icon: Mail,
    },
    {
      label: "Reply rate",
      value: replyRate,
      delta: repliedContactsCount > 0 ? `+${repliedContactsCount} replied` : "0 replies",
      trend: "up" as const,
      icon: TrendingUp,
    },
    {
      label: "Active contacts",
      value: String(contactsList.length),
      delta: contactsList.length > 0 ? `${contactsList.length} leads` : "0 leads",
      trend: "up" as const,
      icon: Users,
    },
  ];

  const filteredContactsList = useMemo(() => {
    return contactsList.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [contactsList, searchQuery]);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenEmailAccounts={() => setShowEmailAccountsModal(true)}
      />
      <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <Topbar
          title="Dashboard"
          onNewContactClick={() => openAddContactModalWithStatus("New Lead")}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenEmailAccounts={() => setShowEmailAccountsModal(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <OnboardingBanner onOpenProfile={() => setShowProfileModal(true)} />

          {/* Real-time Inbound Reply Notification & Action Banner */}
          {contactsList.find((c) => c.status === "Replied") && (
            <ReplyNotificationBanner
              repliedContact={contactsList.find((c) => c.status === "Replied")}
              onStatusUpdated={fetchDashboardData}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <MetricCard key={m.label} {...m} index={i} />
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] items-start">
            {/* Contacts Pipeline Main Panel */}
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-ink">
                    Contacts pipeline {searchQuery ? `(Filtered: "${searchQuery}")` : ""}
                  </h2>
                  {loading && <Loader2 size={15} className="animate-spin text-accent-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAddContactModalWithStatus("New Lead")}
                    className="btn-accent px-3 py-1.5 text-xs sm:hidden"
                  >
                    <Plus size={13} /> Add contact
                  </button>
                  <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
                    <button
                      onClick={() => setView("table")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                        view === "table" ? "bg-ink text-white shadow-soft" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <ListChecks size={13} /> Table
                    </button>
                    <button
                      onClick={() => setView("kanban")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                        view === "kanban" ? "bg-ink text-white shadow-soft" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <GridIcon size={13} /> Kanban
                    </button>
                  </div>

                  <Link
                    href="/sequences"
                    className="flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-700 px-3.5 py-1.5 text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Users size={13} /> Sequence Leads &amp; Stop Controls &rarr;
                  </Link>
                </div>
              </div>

              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {view === "table" ? (
                  <ContactsTable
                    contacts={filteredContactsList}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteContact}
                    onAddContact={() => openAddContactModalWithStatus("New Lead")}
                  />
                ) : (
                  <KanbanBoard
                    contacts={filteredContactsList}
                    onStatusChange={handleStatusChange}
                    onAddContactToStatus={openAddContactModalWithStatus}
                  />
                )}
              </motion.div>
            </div>

            {/* Activity Feed Sidebar Panel */}
            <div className="w-full">
              <ActivityFeed logs={emailLogs} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      {/* Add New Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md card p-6 bg-surface shadow-card relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-ink-muted hover:text-ink"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-ink mb-1">Add New Contact</h3>
            <p className="text-xs text-ink-muted mb-5">Create a lead in your FollowLoop CRM pipeline.</p>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Cyberdyne Systems"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@cyberdyne.io"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Pipeline Status</label>
                <select
                  value={newContact.status}
                  onChange={(e) => setNewContact({ ...newContact, status: e.target.value as ContactStatus })}
                  className="input-field text-sm bg-surface"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="In Sequence">In Sequence</option>
                  <option value="Awaiting Reply">Awaiting Reply</option>
                  <option value="Replied">Replied</option>
                  <option value="Booked">Booked</option>
                  <option value="Stalled">Stalled</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent flex-1 py-2.5 text-sm"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Contact"}
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
    </div>
  );
}
