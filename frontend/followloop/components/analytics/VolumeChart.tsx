"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { weeklyVolume as defaultWeeklyVolume } from "@/lib/data";

interface VolumeChartProps {
  logs?: any[];
}

export default function VolumeChart({ logs = [] }: VolumeChartProps) {
  let chartData = defaultWeeklyVolume;

  if (Array.isArray(logs) && logs.length > 0) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts: Record<string, { sent: number; replied: number }> = {
      Mon: { sent: 0, replied: 0 },
      Tue: { sent: 0, replied: 0 },
      Wed: { sent: 0, replied: 0 },
      Thu: { sent: 0, replied: 0 },
      Fri: { sent: 0, replied: 0 },
      Sat: { sent: 0, replied: 0 },
      Sun: { sent: 0, replied: 0 },
    };

    logs.forEach((log) => {
      if (log.createdAt) {
        const d = new Date(log.createdAt);
        const dayName = days[(d.getDay() + 6) % 7]; // Mon=0
        if (counts[dayName]) {
          counts[dayName].sent += 1;
          if (log.status === "REPLIED" || log.status === "Replied") {
            counts[dayName].replied += 1;
          }
        }
      }
    });

    chartData = days.map((day) => ({
      day,
      sent: counts[day].sent,
      replied: counts[day].replied,
    }));
  }

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Follow-up volume</h3>
          <p className="text-xs text-ink-muted">Sent vs. replied, last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-500" /> Sent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Replied
          </span>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
            <defs>
              <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B5BF6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#5B5BF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="repliedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#12B76A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#12B76A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E7E5E4" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#787680", fontSize: 12 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#787680", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E7E5E4",
                fontSize: 12,
                boxShadow: "0 8px 24px -12px rgba(20,20,25,0.2)",
              }}
            />
            <Area type="monotone" dataKey="sent" stroke="#5B5BF6" strokeWidth={2.5} fill="url(#sentGrad)" />
            <Area type="monotone" dataKey="replied" stroke="#12B76A" strokeWidth={2.5} fill="url(#repliedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
