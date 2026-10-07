"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MuscleGroupVolume } from "@/lib/statistics";
import { MUSCLE_GROUP_LABELS } from "@/lib/exercise-labels";

interface MuscleGroupChartProps {
  data: MuscleGroupVolume[];
}

export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีการบันทึกวอลุ่มการออกกำลังกาย
      </div>
    );
  }

  const chartData = data.map((d) => ({
    muscleGroup: MUSCLE_GROUP_LABELS[d.muscleGroup] ?? d.muscleGroup,
    volume: Math.round(d.volume),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="muscleGroup"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-muted-foreground"
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="volume" fill="var(--primary)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
