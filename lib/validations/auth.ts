import { z } from "zod";

export const credentialsSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CredentialsSignInInput = z.infer<typeof credentialsSignInSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
