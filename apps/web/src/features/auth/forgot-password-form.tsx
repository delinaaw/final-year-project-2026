"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { clerkMessage } from "@/features/auth/clerk-errors";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = handleSubmit(async (values) => {
    if (!isLoaded || !signIn) return;

    setMessage(null);
    setPending(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: values.email,
      });
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setMessage(clerkMessage(error, "Could not send a reset code"));
    } finally {
      setPending(false);
    }
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
        description="Enter the email linked to your account and we'll send you a code to reset it."
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

      <Button type="submit" size="lg" disabled={pending || !isLoaded}>
        {pending ? "Sending…" : "Send reset code"}
      </Button>

      <AuthFooterLink prompt="Remembered your password?" href="/login" label="Log In" />
    </form>
  );
}
