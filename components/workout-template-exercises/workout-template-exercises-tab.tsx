"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ExerciseRow, WorkoutTemplateExerciseRow } from "@/types";
import { WorkoutTemplateExerciseForm } from "./workout-template-exercise-form";
import { getWorkoutTemplateExerciseColumns } from "./workout-template-exercise-columns";

interface WorkoutTemplateExercisesTabProps {
  workoutTemplateId: string;
  initialExercises: WorkoutTemplateExerciseRow[];
  exercises: ExerciseRow[];
}

type FormValues = {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
};

export function WorkoutTemplateExercisesTab({
  workoutTemplateId,
  initialExercises,
  exercises,
}: WorkoutTemplateExercisesTabProps) {
  const [templateExercises, setTemplateExercises] = useState<
    WorkoutTemplateExerciseRow[]
  >(initialExercises);
  const [isSaving, setIsSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  async function persist(next: WorkoutTemplateExerciseRow[]) {
    setIsSaving(true);
    try {
      const updated = await apiRequest<{
        exercises: WorkoutTemplateExerciseRow[];
      }>(`/api/workout-templates/${workoutTemplateId}`, {
        method: "PATCH",
        body: JSON.stringify({
          exercises: next.map((item) => ({
            exerciseId: item.exerciseId._id,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            targetWeight: item.targetWeight,
          })),
        }),
      });
      setTemplateExercises(updated.exercises);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "บันทึกการเปลี่ยนแปลงไม่สำเร็จ"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleAdd() {
    setEditingIndex(null);
    setFormOpen(true);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: FormValues) {
    const exercise = exercises.find((ex) => ex._id === values.exerciseId);
    if (!exercise) return;

    const entry: WorkoutTemplateExerciseRow = { ...values, exerciseId: exercise };
    const next = [...templateExercises];
    if (editingIndex !== null) {
      next[editingIndex] = entry;
    } else {
      next.push(entry);
    }

    await persist(next);
    toast.success(editingIndex !== null ? "อัปเดตท่าออกกำลังกายแล้ว" : "เพิ่มท่าออกกำลังกายแล้ว");
    setFormOpen(false);
  }

  async function handleDeleteConfirm() {
    if (deletingIndex === null) return;
    const next = templateExercises.filter((_, i) => i !== deletingIndex);
    await persist(next);
    toast.success("ลบท่าออกกำลังกายแล้ว");
    setDeletingIndex(null);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= templateExercises.length) return;
    const next = [...templateExercises];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    await persist(next);
  }

  const columns = getWorkoutTemplateExerciseColumns({
    onEdit: handleEdit,
    onDelete: setDeletingIndex,
    onMoveUp: (index) => handleMove(index, "up"),
    onMoveDown: (index) => handleMove(index, "down"),
    lastIndex: templateExercises.length - 1,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={exercises.length === 0}>
          <Plus className="size-4" />
          เพิ่มท่าออกกำลังกาย
        </Button>
      </div>
      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          สร้างท่าออกกำลังกายก่อน จึงจะเพิ่มลงในเทมเพลตนี้ได้
        </p>
      )}
      <DataTable
        columns={columns}
        data={templateExercises}
        isLoading={isSaving}
        emptyMessage="ยังไม่มีท่าออกกำลังกายในเทมเพลตนี้"
      />
      <WorkoutTemplateExerciseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingIndex !== null ? templateExercises[editingIndex] : null}
        exercises={exercises}
        isSubmitting={isSaving}
        onSubmit={handleFormSubmit}
      />
      <ConfirmDeleteDialog
        open={deletingIndex !== null}
        onOpenChange={(open) => !open && setDeletingIndex(null)}
        title="ลบท่าออกกำลังกายออกจากเทมเพลตนี้?"
        description={
          deletingIndex !== null
            ? `การดำเนินการนี้จะลบ "${templateExercises[deletingIndex].exerciseId.name}" ออกจากเทมเพลตนี้`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isLoading={isSaving}
      />
    </div>
  );
}
