import { z } from "zod";

import { PASSWORD_RULES } from "@/features/auth/config";

const password = z
  .string()
  .min(1, "Enter a password")
  .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
    message: "Password does not meet the requirements",
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  remember_me: z.boolean().default(false),
});

export const signUpSchema = z
  .object({
    full_name: z.string().min(1, "Enter your full name").max(120),
    email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
    password,
    confirm_password: z.string().min(1, "Re-enter your password"),
    accepted_terms: z.literal(true, {
      errorMap: () => ({ message: "Accept the Terms & Conditions to continue" }),
    }),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirm_password: z.string().min(1, "Re-enter your password"),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
