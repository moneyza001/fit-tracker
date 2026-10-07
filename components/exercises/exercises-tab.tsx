"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ExerciseRow } from "@/types";
import { ExerciseForm } from "./exercise-form";
import { getExerciseColumns } from "./exercise-columns";

export function ExercisesTab({
  initialExercises,
}: {
  initialExercises: ExerciseRow[];
}) {
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseRow | null>(
    null
  );
  const [deletingExercise, setDeletingExercise] = useState<ExerciseRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((exercise) =>
      [exercise.name, exercise.muscleGroup, exercise.equipment, exercise.type]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [exercises, search]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<ExerciseRow[]>("/api/exercises");
      setExercises(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "โหลดท่าออกกำลังกายไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleAdd() {
    setEditingExercise(null);
    setFormOpen(true);
  }

  function handleEdit(exercise: ExerciseRow) {
    setEditingExercise(exercise);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingExercise) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/exercises/${deletingExercise._id}`, {
        method: "DELETE",
      });
      toast.success("ลบท่าออกกำลังกายแล้ว");
      setDeletingExercise(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ลบท่าออกกำลังกายไม่สำเร็จ"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getExerciseColumns({
    onEdit: handleEdit,
    onDelete: setDeletingExercise,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาท่าออกกำลังกาย..."
            className="pl-8"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          เพิ่มท่าออกกำลังกาย
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={filteredExercises}
        isLoading={isLoading}
        emptyMessage={
          search
            ? "ไม่พบท่าออกกำลังกายที่ตรงกับการค้นหา"
            : "ยังไม่มีท่าออกกำลังกาย เพิ่มท่าแรกเพื่อสร้างคลังท่าของคุณ"
        }
      />
      <ExerciseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editingExercise}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingExercise)}
        onOpenChange={(open) => !open && setDeletingExercise(null)}
        title="ลบท่าออกกำลังกายนี้หรือไม่?"
        description={`การลบนี้จะลบ "${deletingExercise?.name}" ออกจากคลังท่าออกกำลังกายของคุณอย่างถาวร`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
