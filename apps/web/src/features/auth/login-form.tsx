"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { clerkMessage } from "@/features/auth/clerk-errors";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";

export function LoginForm() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const socialSignIn = signIn ?? null;
  const socialLoaded = isLoaded;
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember_me: false },
  });

  const submit = handleSubmit(async (values) => {
    if (!isLoaded || !signIn) return;

    setMessage(null);
    setPending(true);

    try {
      const attempt = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/forms");
        return;
      }

      setMessage("Additional verification is required to finish signing in.");
    } catch (error) {
      setMessage(clerkMessage(error, "That email and password combination is incorrect"));
    } finally {
      setPending(false);
    }
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

      <Button type="submit" size="lg" disabled={pending || !isLoaded}>
        {pending ? "Logging in…" : "Log In"}
      </Button>

      <AuthDivider />
      <SocialButtons signIn={socialSignIn} isLoaded={socialLoaded} />
      <AuthFooterLink prompt="Don't have an account?" href="/signup" label="Sign Up" />
      <div id="clerk-captcha" />
    </form>
  );
}
