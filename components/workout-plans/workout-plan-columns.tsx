"use client";

import Link from "next/link";
import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <Link
          href={`/workout-plans/${row.original._id}`}
          className="font-medium underline underline-offset-2 hover:text-primary"
        >
          {row.original.name}
        </Link>
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
          <Link
            href={`/workout-plans/${row.original._id}`}
            aria-label={`Manage exercises in ${row.original.name}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <Dumbbell className="size-4" />
          </Link>
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
