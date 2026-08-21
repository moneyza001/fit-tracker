"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { apiRequest } from "@/lib/api-client";
import { CURRENT_USER_ID } from "@/lib/constants";
import type { BodyWeightRow } from "@/types";
import { BodyWeightForm } from "./body-weight-form";
import { getBodyWeightColumns } from "./body-weight-columns";

interface BodyWeightTabProps {
  initialEntries: BodyWeightRow[];
}

export function BodyWeightTab({ initialEntries }: BodyWeightTabProps) {
  const [entries, setEntries] = useState<BodyWeightRow[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BodyWeightRow | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<BodyWeightRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await apiRequest<BodyWeightRow[]>(
        `/api/body-weight?userId=${CURRENT_USER_ID}`
      );
      setEntries(items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load entries"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleAdd() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function handleEdit(entry: BodyWeightRow) {
    setEditingEntry(entry);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingEntry) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/body-weight/${deletingEntry._id}`, {
        method: "DELETE",
      });
      toast.success("Entry deleted");
      setDeletingEntry(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete entry"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getBodyWeightColumns({
    onEdit: handleEdit,
    onDelete: setDeletingEntry,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart entries={entries} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Log Weight
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={[...entries].reverse()}
        isLoading={isLoading}
        emptyMessage="No body weight entries yet."
      />
      <BodyWeightForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingEntry)}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        title="Delete entry?"
        description="This will permanently delete this body weight entry."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
