"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { credentialsSignInSchema } from "@/lib/validations";
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

type FormInput = z.infer<typeof credentialsSignInSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(credentialsSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormInput) {
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            เข้าสู่ระบบ
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
