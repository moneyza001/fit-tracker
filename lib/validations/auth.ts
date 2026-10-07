import { z } from "zod";

export const credentialsSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณาระบุรหัสผ่าน"),
});

export const signupSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export type CredentialsSignInInput = z.infer<typeof credentialsSignInSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
