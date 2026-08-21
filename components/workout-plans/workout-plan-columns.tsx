"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import type { WorkoutPlanRow } from "@/types";

interface WorkoutPlanColumnsOptions {
  programNameById: Record<string, string>;
  onEdit: (workoutPlan: WorkoutPlanRow) => void;
  onDelete: (workoutPlan: WorkoutPlanRow) => void;
}

export function getWorkoutPlanColumns({
  programNameById,
  onEdit,
  onDelete,
}: WorkoutPlanColumnsOptions): LegacyColumnDef<WorkoutPlanRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "programId",
      header: "Program",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {programNameById[row.original.programId] ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ row }) => row.original.day,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.original.name}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.original.name}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
