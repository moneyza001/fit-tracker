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
      const items = await apiRequest<BodyWeightRow[]>("/api/body-weight");
      setEntries(items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"
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
      toast.success("ลบรายการแล้ว");
      setDeletingEntry(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ลบรายการไม่สำเร็จ"
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
          <CardTitle>ความก้าวหน้า</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart entries={entries} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          บันทึกน้ำหนัก
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={[...entries].reverse()}
        isLoading={isLoading}
        emptyMessage="ยังไม่มีข้อมูลน้ำหนักตัว"
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
        title="ลบรายการนี้หรือไม่?"
        description="การลบนี้จะลบข้อมูลน้ำหนักตัวนี้อย่างถาวร"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
