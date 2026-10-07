"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import type { BodyWeightRow } from "@/types";
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

const formSchema = z.object({
  date: z.string().min(1, "กรุณาระบุวันที่"),
  weight: z.number().min(0),
  note: z.string().trim().max(500).optional(),
});
type FormInput = z.infer<typeof formSchema>;

interface BodyWeightFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: BodyWeightRow | null;
  onSuccess: () => void;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyValues(): FormInput {
  return { date: todayInputValue(), weight: 0, note: "" };
}

export function BodyWeightForm({
  open,
  onOpenChange,
  entry,
  onSuccess,
}: BodyWeightFormProps) {
  const isEdit = Boolean(entry);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: buildEmptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      entry
        ? {
            date: entry.date.slice(0, 10),
            weight: entry.weight,
            note: entry.note ?? "",
          }
        : buildEmptyValues()
    );
  }, [open, entry, form]);

  async function onSubmit(values: FormInput) {
    const body = {
      date: new Date(values.date).toISOString(),
      weight: values.weight,
      note: values.note,
    };
    try {
      if (isEdit && entry) {
        await apiRequest(`/api/body-weight/${entry._id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast.success("อัปเดตรายการแล้ว");
      } else {
        await apiRequest("/api/body-weight", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success("บันทึกน้ำหนักแล้ว");
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
          <DialogTitle>{isEdit ? "แก้ไขรายการ" : "บันทึกน้ำหนัก"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>น้ำหนัก (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>โน้ต</FormLabel>
                  <FormControl>
                    <Textarea placeholder="โน้ต (ถ้ามี)" {...field} />
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
                {isEdit ? "บันทึกการเปลี่ยนแปลง" : "เพิ่ม"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
