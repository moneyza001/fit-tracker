"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { workoutPlanSchema, type WorkoutPlanInput } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import type { ProgramRow, WorkoutPlanRow } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface WorkoutPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutPlan?: WorkoutPlanRow | null;
  programs: ProgramRow[];
  defaultProgramId?: string;
  onSuccess: () => void;
}

function buildEmptyValues(defaultProgramId?: string): WorkoutPlanInput {
  return {
    programId: defaultProgramId ?? "",
    name: "",
    day: 1,
    description: "",
  };
}

export function WorkoutPlanForm({
  open,
  onOpenChange,
  workoutPlan,
  programs,
  defaultProgramId,
  onSuccess,
}: WorkoutPlanFormProps) {
  const isEdit = Boolean(workoutPlan);

  const form = useForm<WorkoutPlanInput>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: buildEmptyValues(defaultProgramId),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      workoutPlan
        ? {
            programId: workoutPlan.programId,
            name: workoutPlan.name,
            day: workoutPlan.day,
            description: workoutPlan.description ?? "",
          }
        : buildEmptyValues(defaultProgramId)
    );
  }, [open, workoutPlan, defaultProgramId, form]);

  async function onSubmit(values: WorkoutPlanInput) {
    try {
      if (isEdit && workoutPlan) {
        await apiRequest(`/api/workout-plans/${workoutPlan._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("อัปเดตแผนการฝึกแล้ว");
      } else {
        await apiRequest("/api/workout-plans", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("สร้างแผนการฝึกแล้ว");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขแผนการฝึก" : "เพิ่มแผนการฝึก"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>โปรแกรม</FormLabel>
                  <Select
                    items={programs.map((program) => ({
                      value: program._id,
                      label: program.name,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกโปรแกรม" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program._id} value={program._id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ</FormLabel>
                  <FormControl>
                    <Input placeholder="Push A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วัน</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea placeholder="คำอธิบาย (ไม่บังคับ)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้าง"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
