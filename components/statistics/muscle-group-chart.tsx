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

interface MuscleGroupChartProps {
  data: MuscleGroupVolume[];
}

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Legs",
  glutes: "Glutes",
  core: "Core",
  full_body: "Full Body",
  cardio: "Cardio",
};

export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No workout volume logged yet.
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
