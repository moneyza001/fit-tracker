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
    header: "วันที่",
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    id: "sets",
    header: "เซ็ต",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.sets.map((set) => `${set.reps}×${set.weight}kg`).join(", ")}
      </span>
    ),
  },
  {
    accessorKey: "volume",
    header: "วอลุ่ม",
    cell: ({ row }) => `${Math.round(row.original.volume).toLocaleString()} kg`,
  },
  {
    accessorKey: "estimated1RM",
    header: "ประมาณ 1RM",
    cell: ({ row }) => `${Math.round(row.original.estimated1RM * 10) / 10} kg`,
  },
  {
    id: "rpe",
    header: "RPE เฉลี่ย",
    cell: ({ row }) => {
      const rated = row.original.sets.filter((set) => set.rpe !== undefined);
      if (rated.length === 0) return <span className="text-muted-foreground">—</span>;
      const avg =
        rated.reduce((sum, set) => sum + (set.rpe ?? 0), 0) / rated.length;
      return Math.round(avg * 10) / 10;
    },
  },
  {
    accessorKey: "note",
    header: "โน้ต",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.note || "—"}
      </span>
    ),
  },
];

export function ExerciseHistoryTable({ sessions }: ExerciseHistoryTableProps) {
  const rows = [...sessions].reverse();

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="ยังไม่มีประวัติสำหรับท่านี้"
    />
  );
}
