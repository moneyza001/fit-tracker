"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { calculateTotalVolume } from "@/lib/dashboard-stats";
import type { WorkoutLogRow } from "@/types";

export interface HistoryRow extends WorkoutLogRow {
  workoutPlanName: string;
}

const columns: LegacyColumnDef<HistoryRow, unknown>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "workoutPlanName",
    header: "Plan",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.workoutPlanName}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>
        {row.original.status === "completed" ? "completed" : "in progress"}
      </Badge>
    ),
  },
  {
    id: "sets",
    header: "Sets",
    cell: ({ row }) =>
      row.original.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.length,
        0
      ),
  },
  {
    id: "volume",
    header: "Volume",
    cell: ({ row }) =>
      `${Math.round(calculateTotalVolume([row.original])).toLocaleString()} kg`,
  },
  {
    accessorKey: "overallNote",
    header: "Note",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.overallNote || "—"}
      </span>
    ),
  },
];

export function HistoryTable({ logs }: { logs: HistoryRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={logs}
      emptyMessage="No workout history yet."
    />
  );
}
