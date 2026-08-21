"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import type { WorkoutTemplateRow } from "@/types";

interface WorkoutTemplateColumnsOptions {
  onEdit: (workoutTemplate: WorkoutTemplateRow) => void;
  onDelete: (workoutTemplate: WorkoutTemplateRow) => void;
}

export function getWorkoutTemplateColumns({
  onEdit,
  onDelete,
}: WorkoutTemplateColumnsOptions): LegacyColumnDef<WorkoutTemplateRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/workout-templates/${row.original._id}`}
          className="font-medium underline-offset-2 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
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
      id: "exerciseCount",
      header: "Exercises",
      cell: ({ row }) => row.original.exercises.length,
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
