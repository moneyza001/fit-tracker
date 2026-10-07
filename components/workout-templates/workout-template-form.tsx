"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { workoutTemplateSchema } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import type { WorkoutTemplateRow } from "@/types";
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
import { Button } from "@/components/ui/button";

const formSchema = workoutTemplateSchema.pick({ name: true, description: true });
type FormInput = z.infer<typeof formSchema>;

interface WorkoutTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutTemplate?: WorkoutTemplateRow | null;
  onSuccess: () => void;
}

function buildEmptyValues(): FormInput {
  return { name: "", description: "" };
}

export function WorkoutTemplateForm({
  open,
  onOpenChange,
  workoutTemplate,
  onSuccess,
}: WorkoutTemplateFormProps) {
  const isEdit = Boolean(workoutTemplate);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: buildEmptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      workoutTemplate
        ? {
            name: workoutTemplate.name,
            description: workoutTemplate.description ?? "",
          }
        : buildEmptyValues()
    );
  }, [open, workoutTemplate, form]);

  async function onSubmit(values: FormInput) {
    try {
      if (isEdit && workoutTemplate) {
        await apiRequest(`/api/workout-templates/${workoutTemplate._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("อัปเดตเทมเพลตแล้ว");
      } else {
        await apiRequest("/api/workout-templates", {
          method: "POST",
          body: JSON.stringify({ ...values, exercises: [] }),
        });
        toast.success("สร้างเทมเพลตแล้ว");
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
            {isEdit ? "แก้ไขเทมเพลต" : "เพิ่มเทมเพลต"}
          </DialogTitle>
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
                    <Input placeholder="เวิร์คเอาท์ทั้งตัว" {...field} />
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
