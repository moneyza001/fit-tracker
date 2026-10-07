"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ProgramRow, WorkoutPlanRow } from "@/types";
import { WorkoutPlanForm } from "./workout-plan-form";
import { getWorkoutPlanColumns } from "./workout-plan-columns";

interface WorkoutPlansTabProps {
  initialWorkoutPlans: WorkoutPlanRow[];
  programs: ProgramRow[];
}

export function WorkoutPlansTab({
  initialWorkoutPlans,
  programs,
}: WorkoutPlansTabProps) {
  const [workoutPlans, setWorkoutPlans] =
    useState<WorkoutPlanRow[]>(initialWorkoutPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlanRow | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<WorkoutPlanRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const plans = await apiRequest<WorkoutPlanRow[]>("/api/workout-plans");
      setWorkoutPlans(plans);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "โหลดแผนการฝึกไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const programNameById = useMemo(
    () => Object.fromEntries(programs.map((program) => [program._id, program.name])),
    [programs]
  );

  function handleAdd() {
    setEditingPlan(null);
    setFormOpen(true);
  }

  function handleEdit(workoutPlan: WorkoutPlanRow) {
    setEditingPlan(workoutPlan);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingPlan) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/workout-plans/${deletingPlan._id}`, {
        method: "DELETE",
      });
      toast.success("ลบแผนการฝึกแล้ว");
      setDeletingPlan(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ลบแผนการฝึกไม่สำเร็จ"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getWorkoutPlanColumns({
    programNameById,
    onEdit: handleEdit,
    onDelete: setDeletingPlan,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={programs.length === 0}>
          <Plus className="size-4" />
          เพิ่มแผนการฝึก
        </Button>
      </div>
      {programs.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          สร้างโปรแกรมก่อนเพื่อเพิ่มแผนการฝึก
        </p>
      )}
      <DataTable
        columns={columns}
        data={workoutPlans}
        isLoading={isLoading}
        emptyMessage="ยังไม่มีแผนการฝึก"
      />
      <WorkoutPlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workoutPlan={editingPlan}
        programs={programs}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingPlan)}
        onOpenChange={(open) => !open && setDeletingPlan(null)}
        title="ลบแผนการฝึกนี้หรือไม่?"
        description={`การลบนี้จะลบ "${deletingPlan?.name}" และเป้าหมายท่าออกกำลังกายทั้งหมดอย่างถาวร`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
