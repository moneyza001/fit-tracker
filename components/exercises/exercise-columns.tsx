"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExerciseRow } from "@/types";

interface ExerciseColumnsOptions {
  onEdit: (exercise: ExerciseRow) => void;
  onDelete: (exercise: ExerciseRow) => void;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function getExerciseColumns({
  onEdit,
  onDelete,
}: ExerciseColumnsOptions): LegacyColumnDef<ExerciseRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/exercises/${row.original._id}`}
          className="font-medium underline-offset-2 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "muscleGroup",
      header: "Muscle Group",
      cell: ({ row }) => (
        <Badge variant="outline">{formatLabel(row.original.muscleGroup)}</Badge>
      ),
    },
    {
      accessorKey: "equipment",
      header: "Equipment",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatLabel(row.original.equipment)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatLabel(row.original.type)}
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
