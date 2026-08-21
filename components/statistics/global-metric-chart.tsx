"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GLOBAL_METRICS,
  GLOBAL_METRIC_LABELS,
  type GlobalMetric,
  type GlobalMetricPoint,
} from "@/lib/statistics";
import type { BodyWeightRow } from "@/types";

interface GlobalMetricChartProps {
  bodyWeights: BodyWeightRow[];
  series: GlobalMetricPoint[];
}

const AXIS_PROPS = {
  tick: { fontSize: 12 },
  stroke: "currentColor",
  className: "text-muted-foreground",
};

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  borderRadius: "var(--radius-lg)",
  fontSize: 12,
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function GlobalMetricChart({ bodyWeights, series }: GlobalMetricChartProps) {
  const [metric, setMetric] = useState<GlobalMetric>("weight");

  const weightData = bodyWeights.map((entry) => ({
    date: formatDate(entry.date),
    value: entry.weight,
  }));
  const volumeData = series.map((point) => ({
    date: formatDate(point.date),
    value: Math.round(point.volume),
  }));
  const estimated1RMData = series.map((point) => ({
    date: formatDate(point.date),
    value: Math.round(point.estimated1RM * 10) / 10,
  }));
  const rpeRirData = series
    .filter((point) => point.rpe !== null || point.rir !== null)
    .map((point) => ({
      date: formatDate(point.date),
      rpe: point.rpe !== null ? Math.round(point.rpe * 10) / 10 : null,
      rir: point.rir !== null ? Math.round(point.rir * 10) / 10 : null,
    }));

  const isEmpty =
    (metric === "weight" && weightData.length === 0) ||
    (metric === "volume" && volumeData.length === 0) ||
    (metric === "estimated1RM" && estimated1RMData.length === 0) ||
    (metric === "rpeRir" && rpeRirData.length === 0);

  return (
    <div className="space-y-3">
      <Tabs value={metric} onValueChange={(value) => setMetric(value as GlobalMetric)}>
        <TabsList>
          {GLOBAL_METRICS.map((m) => (
            <TabsTrigger key={m} value={m}>
              {GLOBAL_METRIC_LABELS[m]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isEmpty ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Not enough data yet.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {metric === "rpeRir" ? (
              <LineChart data={rpeRirData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} width={32} domain={[0, 10]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="rpe"
                  name="RPE"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="rir"
                  name="RIR"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            ) : (
              <LineChart
                data={
                  metric === "weight"
                    ? weightData
                    : metric === "volume"
                      ? volumeData
                      : estimated1RMData
                }
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
