"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import type { BodyWeightRow } from "@/types";

interface BodyWeightColumnsOptions {
  onEdit: (entry: BodyWeightRow) => void;
  onDelete: (entry: BodyWeightRow) => void;
}

export function getBodyWeightColumns({
  onEdit,
  onDelete,
}: BodyWeightColumnsOptions): LegacyColumnDef<BodyWeightRow, unknown>[] {
  return [
    {
      accessorKey: "date",
      header: "วันที่",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.original.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "weight",
      header: "น้ำหนัก",
      cell: ({ row }) => `${row.original.weight} kg`,
    },
    {
      accessorKey: "note",
      header: "โน้ต",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.note || "—"}
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
            aria-label={`แก้ไขรายการจากวันที่ ${row.original.date}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`ลบรายการจากวันที่ ${row.original.date}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
