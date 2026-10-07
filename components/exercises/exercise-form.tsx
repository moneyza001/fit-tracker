"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { exerciseSchema, type ExerciseInput } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_TYPES, type ExerciseRow } from "@/types";
import { EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, MUSCLE_GROUP_LABELS } from "@/lib/exercise-labels";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ExerciseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: ExerciseRow | null;
  onSuccess: () => void;
}

const emptyValues: ExerciseInput = {
  name: "",
  muscleGroup: "chest",
  equipment: "barbell",
  type: "compound",
};

export function ExerciseForm({
  open,
  onOpenChange,
  exercise,
  onSuccess,
}: ExerciseFormProps) {
  const isEdit = Boolean(exercise);

  const form = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      exercise
        ? {
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            type: exercise.type,
          }
        : emptyValues
    );
  }, [open, exercise, form]);

  async function onSubmit(values: ExerciseInput) {
    try {
      if (isEdit && exercise) {
        await apiRequest(`/api/exercises/${exercise._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("อัปเดตท่าออกกำลังกายแล้ว");
      } else {
        await apiRequest("/api/exercises", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("สร้างท่าออกกำลังกายแล้ว");
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
          <DialogTitle>{isEdit ? "แก้ไขท่าออกกำลังกาย" : "เพิ่มท่าออกกำลังกาย"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ</FormLabel>
                  <FormControl>
                    <Input placeholder="เบนช์เพรส" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="muscleGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>กลุ่มกล้ามเนื้อ</FormLabel>
                  <Select
                    items={MUSCLE_GROUPS.map((group) => ({
                      value: group,
                      label: MUSCLE_GROUP_LABELS[group],
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกกลุ่มกล้ามเนื้อ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MUSCLE_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                          {MUSCLE_GROUP_LABELS[group]}
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
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อุปกรณ์</FormLabel>
                  <Select
                    items={EQUIPMENT_TYPES.map((equipment) => ({
                      value: equipment,
                      label: EQUIPMENT_LABELS[equipment],
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกอุปกรณ์" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map((equipment) => (
                        <SelectItem key={equipment} value={equipment}>
                          {EQUIPMENT_LABELS[equipment]}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภท</FormLabel>
                  <Select
                    items={EXERCISE_TYPES.map((type) => ({
                      value: type,
                      label: EXERCISE_TYPE_LABELS[type],
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXERCISE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {EXERCISE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
