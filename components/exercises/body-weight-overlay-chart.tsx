"use client";

import Link from "next/link";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyWeightOverlayPoint } from "@/lib/body-weight-overlay";

interface BodyWeightOverlayChartProps {
  data: BodyWeightOverlayPoint[];
  hasBodyWeightEntries: boolean;
}

const AXIS_PROPS = {
  tick: { fontSize: 12 },
  stroke: "currentColor",
  className: "text-muted-foreground",
};

export function BodyWeightOverlayChart({
  data,
  hasBodyWeightEntries,
}: BodyWeightOverlayChartProps) {
  if (!hasBodyWeightEntries) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>บันทึกน้ำหนักตัวของคุณเพื่อเทียบกับท่านี้</p>
        <Link
          href="/body-weight"
          className="text-foreground underline-offset-2 hover:underline"
        >
          บันทึกน้ำหนัก
        </Link>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    liftedWeight: point.liftedWeight,
    bodyWeight: point.bodyWeight,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" {...AXIS_PROPS} />
          <YAxis yAxisId="lifted" {...AXIS_PROPS} width={40} />
          <YAxis yAxisId="body" orientation="right" {...AXIS_PROPS} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            yAxisId="lifted"
            type="monotone"
            dataKey="liftedWeight"
            name="น้ำหนักที่ยก"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="body"
            type="monotone"
            dataKey="bodyWeight"
            name="น้ำหนักตัว"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
