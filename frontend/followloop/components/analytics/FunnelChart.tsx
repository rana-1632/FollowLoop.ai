"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { funnelData as defaultFunnelData } from "@/lib/data";

const colors = ["#191A23", "#4640E0", "#5B5BF6", "#9FA8FF"];

interface FunnelChartProps {
  logs?: any[];
  contacts?: any[];
}

export default function FunnelChart({ logs = [], contacts = [] }: FunnelChartProps) {
  let chartData = defaultFunnelData;

  if ((Array.isArray(logs) && logs.length > 0) || (Array.isArray(contacts) && contacts.length > 0)) {
    const sentCount = logs.length;
    const openedCount = logs.filter((l) => l.status === "OPENED" || l.status === "Opened").length;
    const repliedCount = contacts.filter((c) => c.status === "Replied").length;
    const bookedCount = contacts.filter((c) => c.status === "Booked").length;

    chartData = [
      { stage: "Sent", value: sentCount },
      { stage: "Opened", value: openedCount },
      { stage: "Replied", value: repliedCount },
      { stage: "Booked", value: bookedCount },
    ];
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-ink">Conversion funnel</h3>
        <p className="text-xs text-ink-muted">Sent → opened → replied → booked</p>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
            <CartesianGrid horizontal={false} stroke="#E7E5E4" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#787680", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              width={70}
              tick={{ fill: "#44434F", fontSize: 12.5, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(91,91,246,0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E7E5E4",
                fontSize: 12,
                boxShadow: "0 8px 24px -12px rgba(20,20,25,0.2)",
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
