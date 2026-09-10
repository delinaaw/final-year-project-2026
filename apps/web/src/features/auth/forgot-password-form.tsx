"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";
import { useAuthError } from "@/features/auth/use-auth-error";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { message, capture, clear } = useAuthError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) =>
      router.push(`/check-email?email=${encodeURIComponent(variables.email)}`),
    onError: capture,
  });

  const submit = handleSubmit((values) => {
    clear();
    mutation.mutate(values);
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <Link
        href="/login"
        className="focus-ring flex w-fit items-center gap-2 rounded text-body-s font-semibold text-content-secondary transition-colors hover:text-content-primary"
      >
        <ArrowLeft className="size-4" />
        Back to log in
      </Link>

      <AuthHeading
        title="Forgot your password?"
        description="Enter the email linked to your account and we'll send you a link to reset it."
      />

      {message ? <AuthAlert message={message} /> : null}

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : "Send reset link"}
      </Button>

      <AuthFooterLink prompt="Remembered your password?" href="/login" label="Log In" />
    </form>
  );
}
