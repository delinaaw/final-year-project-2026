"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordInput } from "@/components/ui/password-input";
import { clerkMessage } from "@/features/auth/clerk-errors";
import { PASSWORD_RULES } from "@/features/auth/config";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "";
  const { signIn, setActive, isLoaded } = useSignIn();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  const submit = handleSubmit(async (values) => {
    if (!isLoaded || !signIn) return;

    if (code.length < 6) {
      setMessage("Enter the 6-digit code from your email");
      return;
    }

    setMessage(null);
    setPending(true);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: values.password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/password-updated");
        return;
      }

      setMessage("That did not complete the reset. Try again.");
    } catch (error) {
      setMessage(clerkMessage(error, "That code is not correct"));
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
        title="Set a new password"
        description={
          email
            ? `Enter the code sent to ${email} and choose a new password.`
            : "Enter the code from your email and choose a new password."
        }
      />

      {message ? <AuthAlert message={message} /> : null}

      <div className="flex flex-col gap-5">
        <Field label="Reset code" htmlFor="reset-code">
          <OtpInput value={code} onChange={setCode} invalid={Boolean(message)} />
        </Field>

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
                    passed ? "bg-state-success" : "border border-line bg-surface-subtle",
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

      <Button type="submit" size="lg" disabled={pending || !isLoaded}>
        {pending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
