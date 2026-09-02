"use client";

import { useMemo, useState } from "react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Search } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) =>
      [
        log.workoutPlanName,
        log.status === "completed" ? "completed" : "in progress",
        log.overallNote ?? "",
        new Date(log.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [logs, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history..."
          className="pl-8"
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredLogs}
        emptyMessage={
          search ? "No workouts match your search." : "No workout history yet."
        }
      />
    </div>
  );
}
