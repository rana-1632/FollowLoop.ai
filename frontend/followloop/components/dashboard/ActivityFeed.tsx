import React, { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  MessageSquareText,
  PlayCircle,
  CalendarCheck,
  Send,
  AlertTriangle,
  Activity,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

const iconMap = {
  reply: { icon: MessageSquareText, color: "bg-sky-50 text-sky-600 border border-sky-100" },
  start: { icon: PlayCircle, color: "bg-accent-50 text-accent-600 border border-accent-100" },
  booked: { icon: CalendarCheck, color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  sent: { icon: Send, color: "bg-slate-100 text-slate-600 border border-slate-200" },
  stalled: { icon: AlertTriangle, color: "bg-rose-50 text-rose-600 border border-rose-100" },
};

interface FeedItem {
  id: string;
  text: string;
  time: string;
  type: "reply" | "start" | "booked" | "sent" | "stalled";
}

interface ActivityFeedProps {
  logs?: any[];
  loading?: boolean;
}

function ActivityFeed({ logs: propLogs, loading: propLoading }: ActivityFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(propLoading ?? true);

  const formatFeedItems = (logs: any[]): FeedItem[] => {
    return logs.map((log: any, idx: number) => {
      const contactName = log.contact?.name || "Lead";
      const dateStr = log.createdAt
        ? new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Recently";
      const isDelivered = log.status === "DELIVERED" || log.status === "SENT";
      return {
        id: log.id || `log_${idx}`,
        text: isDelivered
          ? `Outreach "${log.subject || "Follow-up"}" sent to ${contactName}`
          : `Task status update for ${contactName}: ${log.status}`,
        time: dateStr,
        type: isDelivered ? "sent" : "start",
      };
    });
  };

  useEffect(() => {
    if (propLogs !== undefined) {
      setLoading(propLoading ?? false);
      if (Array.isArray(propLogs) && propLogs.length > 0) {
        setFeed(formatFeedItems(propLogs));
      } else {
        setFeed([]);
      }
      return;
    }

    async function loadActivity() {
      try {
        setLoading(true);
        const logs = await api.analytics.getLogs();
        if (Array.isArray(logs) && logs.length > 0) {
          setFeed(formatFeedItems(logs));
        } else {
          setFeed([]);
        }
      } catch (err) {
        console.warn("Could not fetch activity feed:", err);
        setFeed([]);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [propLogs, propLoading]);

  return (
    <div className="card p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Activity size={16} className="text-accent-500" />
            Recent Activity
          </h3>
          <span className="text-[11px] font-semibold text-ink-muted bg-surface-muted px-2 py-0.5 rounded-full">
            Live Audit
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-ink-muted">Loading live activity log...</div>
        ) : feed.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted flex flex-col items-center justify-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-surface-muted flex items-center justify-center text-ink-muted/60">
              <Clock size={18} />
            </div>
            <p className="font-semibold text-ink">No activity recorded yet</p>
            <p className="text-[11px] text-ink-muted/80 max-w-[220px] leading-relaxed">
              Create a lead or dispatch an AI email sequence to see real-time interaction logs here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((item, i) => {
              const { icon: Icon, color } = iconMap[item.type] || iconMap.sent;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex items-start gap-3 border-b border-border/50 pb-3.5 last:border-0 last:pb-0"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color} shadow-soft mt-0.5`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug font-medium text-ink-soft break-words">
                      {item.text}
                    </p>
                    <p className="mt-1 text-[10.5px] font-medium text-ink-muted flex items-center gap-1">
                      <Clock size={10} />
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-4 text-center">
        <p className="text-[11px] text-ink-muted">
          All system dispatches are encrypted & logged.
        </p>
      </div>
    </div>
  );
}

export default memo(ActivityFeed);
