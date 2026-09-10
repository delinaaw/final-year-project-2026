"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { authApi } from "@/features/auth/api";
import { PASSWORD_RULES } from "@/features/auth/config";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { useAuthError } from "@/features/auth/use-auth-error";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { message, capture, clear } = useAuthError();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const password = watch("password");

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => router.push("/password-updated"),
    onError: capture,
  });

  const submit = handleSubmit((values) => {
    clear();
    mutation.mutate({ token, password: values.password });
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
        title="Set a new password"
        description="Your new password must be different from any you have used before."
      />

      {!token ? (
        <AuthAlert message="This reset link is incomplete. Request a new one from the login screen." />
      ) : null}
      {message ? <AuthAlert message={message} /> : null}

      <div className="flex flex-col gap-5">
        <Field label="New password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a password"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirm new password"
          htmlFor="confirm_password"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            invalid={Boolean(errors.confirm_password)}
            {...register("confirm_password")}
          />
        </Field>

        <ul className="flex flex-col gap-2.5">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password ?? "");
            return (
              <li key={rule.id} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full transition-colors",
                    passed ? "bg-state-success" : "bg-surface-subtle border border-line",
                  )}
                >
                  <Check
                    className={cn(
                      "size-3",
                      passed ? "text-content-inverse" : "text-content-placeholder",
                    )}
                    strokeWidth={3}
                  />
                </span>
                <span
                  className={cn(
                    "text-body-s",
                    passed ? "text-content-primary" : "text-content-secondary",
                  )}
                >
                  {rule.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Button type="submit" size="lg" disabled={mutation.isPending || !token}>
        {mutation.isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
