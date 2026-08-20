"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import MetricCard from "@/components/dashboard/MetricCard";
import VolumeChart from "@/components/analytics/VolumeChart";
import FunnelChart from "@/components/analytics/FunnelChart";
import DeliveryLogTable from "@/components/analytics/DeliveryLogTable";
import { Send, MailOpen, Reply, CalendarCheck } from "lucide-react";
import { api } from "@/lib/api";

import ProfileModal from "@/components/dashboard/ProfileModal";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

export default function AnalyticsPage() {
  const { isCollapsed } = useLayout();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [logsRes, contactsRes] = await Promise.allSettled([
        api.analytics.getLogs(),
        api.contacts.getAll(),
      ]);

      if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
        setLogs(logsRes.value);
      } else {
        setLogs([]);
      }

      if (contactsRes.status === "fulfilled" && Array.isArray(contactsRes.value)) {
        setContacts(contactsRes.value);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.warn("Could not fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const totalSent = logs.length;
  const openedLogs = logs.filter((l) => l.status === "OPENED" || l.status === "Opened").length;
  const openRate = totalSent > 0 ? `${Math.round((openedLogs / totalSent) * 100)}%` : "0%";

  const repliedContacts = contacts.filter((c) => c.status === "Replied").length;
  const replyRate = contacts.length > 0 ? `${Math.round((repliedContacts / contacts.length) * 100)}%` : "0%";

  const bookedCount = contacts.filter((c) => c.status === "Booked").length;

  const metrics = [
    { label: "Total sent (30d)", value: String(totalSent), delta: totalSent > 0 ? `+${totalSent} total` : "0 sent", trend: "up" as const, icon: Send },
    { label: "Open rate", value: openRate, delta: openedLogs > 0 ? `${openedLogs} opened` : "0 opened", trend: "up" as const, icon: MailOpen },
    { label: "Reply rate", value: replyRate, delta: repliedContacts > 0 ? `${repliedContacts} replied` : "0 replies", trend: "up" as const, icon: Reply },
    { label: "Calls booked", value: String(bookedCount), delta: bookedCount > 0 ? `${bookedCount} booked` : "0 booked", trend: "up" as const, icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar onOpenProfile={() => setShowProfileModal(true)} />
      <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <Topbar
          title="Analytics"
          subtitle="Delivery performance across every active sequence."
          onOpenProfile={() => setShowProfileModal(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((m, i) => (
              <MetricCard key={m.label} {...m} index={i} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <VolumeChart logs={logs} />
            <FunnelChart logs={logs} contacts={contacts} />
          </div>

          <div className="mt-6">
            <DeliveryLogTable logs={logs} loading={loading} onRefresh={loadAnalyticsData} />
          </div>
        </main>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
