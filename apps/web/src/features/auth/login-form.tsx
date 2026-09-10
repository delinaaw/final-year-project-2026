"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authApi } from "@/features/auth/api";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useAuthError } from "@/features/auth/use-auth-error";
import { useAuthSuccess } from "@/hooks/use-session";

export function LoginForm() {
  const onSuccess = useAuthSuccess();
  const { message, capture, clear } = useAuthError();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember_me: false },
  });

  const mutation = useMutation({
    mutationFn: authApi.logIn,
    onSuccess: (response) => onSuccess(response, "/forms"),
    onError: capture,
  });

  const submit = handleSubmit((values) => {
    clear();
    mutation.mutate(values);
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <AuthHeading
        title="Welcome back"
        description="Log in to keep building and collecting voice-first responses."
      />

      {message ? <AuthAlert message={message} /> : null}

      <div className="flex flex-col gap-5">
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

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Controller
              name="remember_me"
              control={control}
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <span className="text-body-s text-content-secondary">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="focus-ring rounded text-body-s font-semibold text-content-link"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? "Logging in…" : "Log In"}
      </Button>

      <AuthDivider />
      <SocialButtons />
      <AuthFooterLink prompt="Don't have an account?" href="/signup" label="Sign Up" />
    </form>
  );
}
