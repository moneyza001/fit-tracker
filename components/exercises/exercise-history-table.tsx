"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table";
import type { ExerciseSessionStat } from "@/lib/exercise-stats";

interface ExerciseHistoryTableProps {
  sessions: ExerciseSessionStat[];
}

const columns: LegacyColumnDef<ExerciseSessionStat, unknown>[] = [
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
    id: "sets",
    header: "Sets",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.sets.map((set) => `${set.reps}×${set.weight}kg`).join(", ")}
      </span>
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume",
    cell: ({ row }) => `${Math.round(row.original.volume).toLocaleString()} kg`,
  },
  {
    accessorKey: "estimated1RM",
    header: "Est. 1RM",
    cell: ({ row }) => `${Math.round(row.original.estimated1RM * 10) / 10} kg`,
  },
];

export function ExerciseHistoryTable({ sessions }: ExerciseHistoryTableProps) {
  const rows = [...sessions].reverse();

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="No history yet for this exercise."
    />
  );
}
