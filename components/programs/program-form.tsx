"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  programSchema,
  type ProgramInput,
  type ProgramFormInput,
} from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import { PROGRAM_STATUSES, type ProgramRow } from "@/types";
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

interface ProgramFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: ProgramRow | null;
  onSuccess: () => void;
}

const emptyValues: ProgramFormInput = {
  name: "",
  description: "",
  status: "active",
};

export function ProgramForm({
  open,
  onOpenChange,
  program,
  onSuccess,
}: ProgramFormProps) {
  const isEdit = Boolean(program);

  const form = useForm<ProgramFormInput, unknown, ProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      program
        ? {
            name: program.name,
            description: program.description ?? "",
            status: program.status,
          }
        : emptyValues
    );
  }, [open, program, form]);

  async function onSubmit(values: ProgramInput) {
    try {
      if (isEdit && program) {
        await apiRequest(`/api/programs/${program._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("Program updated");
      } else {
        await apiRequest("/api/programs", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Program created");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Program" : "Add Program"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Push Pull Legs" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    items={PROGRAM_STATUSES.map((status) => ({
                      value: status,
                      label: status,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROGRAM_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
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
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEdit ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
