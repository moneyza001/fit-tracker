"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildVolumeTrend, type VolumeTrendBucket } from "@/lib/statistics";
import type { WorkoutLogRow } from "@/types";

interface VolumeTrendChartProps {
  logs: WorkoutLogRow[];
}

function formatPeriod(period: string, bucket: VolumeTrendBucket): string {
  if (bucket === "month") {
    const [year, month] = period.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  }
  return new Date(period).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function VolumeTrendChart({ logs }: VolumeTrendChartProps) {
  const [bucket, setBucket] = useState<VolumeTrendBucket>("week");

  const data = useMemo(() => {
    return buildVolumeTrend(logs, bucket).map((point) => ({
      period: formatPeriod(point.period, bucket),
      volume: Math.round(point.volume),
    }));
  }, [logs, bucket]);

  return (
    <div className="space-y-3">
      <Tabs value={bucket} onValueChange={(value) => setBucket(value as VolumeTrendBucket)}>
        <TabsList>
          <TabsTrigger value="week">รายสัปดาห์</TabsTrigger>
          <TabsTrigger value="month">รายเดือน</TabsTrigger>
        </TabsList>
      </Tabs>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          ยังไม่มีการบันทึกวอลุ่มการออกกำลังกาย
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="period"
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
              <Bar dataKey="volume" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
