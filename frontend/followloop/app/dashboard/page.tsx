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
import LeadDetailModal from "@/components/dashboard/LeadDetailModal";
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

  // Profile Modal & Email Accounts Modal & New Contact Modal & Lead Detail Modal State
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showEmailAccountsModal, setShowEmailAccountsModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showLeadDetailModal, setShowLeadDetailModal] = useState<boolean>(false);
  const [leadDetailTab, setLeadDetailTab] = useState<"unibox" | "timeline">("unibox");

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
      console.warn("Could not delete contact on backend:", err);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await api.contacts.create({
        name: newContact.name,
        company: newContact.company,
        email: newContact.email,
        status: newContact.status,
        nextStep: newContact.nextStep,
      });

      setContactsList((prev) => [created, ...prev]);
      setShowModal(false);
      setNewContact({
        name: "",
        company: "",
        email: "",
        status: "New Lead",
        nextStep: "Sequence starts soon",
      });
    } catch (err) {
      console.warn("Failed to create contact:", err);
      // Fallback local addition if API fails
      const fallback: Contact = {
        id: `temp_${Date.now()}`,
        name: newContact.name,
        company: newContact.company,
        email: newContact.email,
        status: newContact.status,
        nextStep: newContact.nextStep,
        lastTouch: "Just now",
        score: 50,
      };
      setContactsList((prev) => [fallback, ...prev]);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactsList;
    const q = searchQuery.toLowerCase();
    return contactsList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [contactsList, searchQuery]);

  // Check if any contact replied recently
  const repliedContact = useMemo(() => {
    return contactsList.find((c) => c.status === "Replied") || null;
  }, [contactsList]);

  // Compute live metrics
  const activeSequencesCount = useMemo(() => {
    return contactsList.filter((c) => c.status === "In Sequence").length;
  }, [contactsList]);

  const repliedCount = useMemo(() => {
    return contactsList.filter((c) => c.status === "Replied").length;
  }, [contactsList]);

  const replyRateFormatted = useMemo(() => {
    if (contactsList.length === 0) return "0%";
    const rate = Math.round((repliedCount / contactsList.length) * 100);
    return `${rate}%`;
  }, [contactsList, repliedCount]);

  const handleOpenLeadModal = (id: string, tab: "unibox" | "timeline" = "unibox") => {
    setSelectedLeadId(id);
    setLeadDetailTab(tab);
    setShowLeadDetailModal(true);
  };

  return (
    <div className="flex min-h-screen bg-canvas font-sans antialiased text-ink">
      <Sidebar onOpenEmailAccounts={() => setShowEmailAccountsModal(true)} />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-w-0",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Topbar
          title="CRM Lead Pipeline"
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenEmailAccounts={() => setShowEmailAccountsModal(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Onboarding Guide Banner */}
          <OnboardingBanner onOpenProfile={() => setShowProfileModal(true)} />

          {/* Reply Notification Banner */}
          <ReplyNotificationBanner
            repliedContact={repliedContact}
            onStatusUpdated={fetchDashboardData}
          />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active Sequences"
              value={activeSequencesCount.toString()}
              delta="+14%"
              trend="up"
              icon={Mail}
              index={0}
            />
            <MetricCard
              label="Total Contacts"
              value={contactsList.length.toString()}
              delta="+8"
              trend="up"
              icon={Users}
              index={1}
            />
            <MetricCard
              label="Reply Rate"
              value={replyRateFormatted}
              delta="+4.2%"
              trend="up"
              icon={TrendingUp}
              index={2}
            />
            <MetricCard
              label="Pending Tasks"
              value={tasksList.filter((t) => t.status === "PENDING").length.toString()}
              delta="Auto"
              trend="up"
              icon={Timer}
              index={3}
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border shadow-soft">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Filter by lead name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field py-2 text-xs bg-canvas"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="flex items-center rounded-xl bg-surface-muted p-1 border border-border/60">
                    <button
                      onClick={() => setView("table")}
                      className={cn(
                        "rounded-lg p-1.5 text-xs font-medium transition-all flex items-center gap-1",
                        view === "table"
                          ? "bg-surface text-ink shadow-soft"
                          : "text-ink-muted hover:text-ink"
                      )}
                      title="Table View"
                    >
                      <ListChecks size={15} /> <span className="hidden sm:inline">Table</span>
                    </button>
                    <button
                      onClick={() => setView("kanban")}
                      className={cn(
                        "rounded-lg p-1.5 text-xs font-medium transition-all flex items-center gap-1",
                        view === "kanban"
                          ? "bg-surface text-ink shadow-soft"
                          : "text-ink-muted hover:text-ink"
                      )}
                      title="Kanban View"
                    >
                      <GridIcon size={15} /> <span className="hidden sm:inline">Kanban</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-accent px-3 py-2 text-xs flex items-center gap-1.5 shadow-soft"
                  >
                    <Plus size={15} /> Add Lead
                  </button>
                </div>
              </div>

              {/* View Rendering */}
              {loading ? (
                <div className="card p-12 text-center flex flex-col items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-accent-500 mb-2" />
                  <p className="text-xs text-ink-muted">Loading CRM Contacts...</p>
                </div>
              ) : view === "table" ? (
                <ContactsTable
                  contacts={filteredContacts}
                  onDelete={handleDeleteContact}
                  onStatusChange={handleStatusChange}
                  onAddContact={() => setShowModal(true)}
                  onSelectContact={(id) => handleOpenLeadModal(id, "unibox")}
                />
              ) : (
                <KanbanBoard
                  contacts={filteredContacts}
                  onStatusChange={handleStatusChange}
                  onAddContactToStatus={(status) => {
                    setNewContact((prev) => ({ ...prev, status }));
                    setShowModal(true);
                  }}
                  onSelectContact={(id) => handleOpenLeadModal(id, "unibox")}
                />
              )}
            </div>

            {/* Sidebar Activity Feed */}
            <div className="space-y-4">
              <ActivityFeed logs={emailLogs} />
            </div>
          </div>
        </main>
      </div>

      {/* New Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md card p-6 bg-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-ink">Add New Contact</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-muted"
              >
                <X size={18} />
              </button>
            </div>

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

      {/* Lead Detail & Thread Modal */}
      <LeadDetailModal
        contactId={selectedLeadId}
        isOpen={showLeadDetailModal}
        onClose={() => setShowLeadDetailModal(false)}
        onContactUpdated={fetchDashboardData}
        initialTab={leadDetailTab}
      />

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
