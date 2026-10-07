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
    header: "วันที่",
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "workoutPlanName",
    header: "แผนการฝึก",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.workoutPlanName}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>
        {row.original.status === "completed" ? "เสร็จสิ้น" : "กำลังดำเนินการ"}
      </Badge>
    ),
  },
  {
    id: "sets",
    header: "เซ็ต",
    cell: ({ row }) =>
      row.original.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.length,
        0
      ),
  },
  {
    id: "volume",
    header: "วอลุ่ม",
    cell: ({ row }) =>
      `${Math.round(calculateTotalVolume([row.original])).toLocaleString()} kg`,
  },
  {
    accessorKey: "overallNote",
    header: "โน้ต",
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
        log.status === "completed" ? "เสร็จสิ้น" : "กำลังดำเนินการ",
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
          placeholder="ค้นหาประวัติ..."
          className="pl-8"
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredLogs}
        emptyMessage={
          search ? "ไม่พบเวิร์คเอาท์ที่ตรงกับการค้นหาของคุณ" : "ยังไม่มีประวัติเวิร์คเอาท์"
        }
      />
    </div>
  );
}
