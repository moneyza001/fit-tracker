"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyWeightRow } from "@/types";

interface WeightChartProps {
  entries: BodyWeightRow[];
}

export function WeightChart({ entries }: WeightChartProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีข้อมูลน้ำหนักตัว
      </div>
    );
  }

  const data = entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    weight: entry.weight,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-muted-foreground"
            domain={["dataMin - 2", "dataMax + 2"]}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 12,
            }}
            labelClassName="text-foreground"
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
