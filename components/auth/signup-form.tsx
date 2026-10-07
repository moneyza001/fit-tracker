"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { signupSchema } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type FormInput = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormInput) {
    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("สร้างบัญชีแล้ว — กรุณาเข้าสู่ระบบ");
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดบางอย่าง"
      );
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input placeholder="ไม่บังคับ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อีเมล</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รหัสผ่าน</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            สร้างบัญชี
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        ดำเนินการต่อด้วย Google
      </Button>
    </div>
  );
}
