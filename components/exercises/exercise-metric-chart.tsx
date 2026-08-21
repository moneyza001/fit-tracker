"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EXERCISE_METRICS,
  EXERCISE_METRIC_LABELS,
  metricValue,
  type ExerciseMetric,
  type ExerciseSessionStat,
} from "@/lib/exercise-stats";

interface ExerciseMetricChartProps {
  sessions: ExerciseSessionStat[];
}

export function ExerciseMetricChart({ sessions }: ExerciseMetricChartProps) {
  const [metric, setMetric] = useState<ExerciseMetric>("weight");

  const data = sessions.map((session) => ({
    date: new Date(session.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    value: Math.round(metricValue(session, metric) * 100) / 100,
  }));

  return (
    <div className="space-y-3">
      <Tabs value={metric} onValueChange={(value) => setMetric(value as ExerciseMetric)}>
        <TabsList>
          {EXERCISE_METRICS.map((m) => (
            <TabsTrigger key={m} value={m}>
              {EXERCISE_METRIC_LABELS[m]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {sessions.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          No history yet for this exercise.
        </div>
      ) : (
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
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
