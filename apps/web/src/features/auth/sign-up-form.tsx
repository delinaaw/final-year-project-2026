"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
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
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";

export function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();
  const { signIn: socialSignIn, isLoaded: socialLoaded } = useSignIn();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      accepted_terms: false as unknown as true,
    },
  });

  const submit = handleSubmit(async (values) => {
    if (!isLoaded || !signUp) return;

    setMessage(null);
    setPending(true);

    const [firstName, ...rest] = values.full_name.trim().split(" ");

    try {
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: firstName || values.full_name,
        lastName: rest.join(" ") || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push("/verify-email");
    } catch (error) {
      setMessage(clerkMessage(error, "Could not create your account"));
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <AuthHeading
        title="Create your account"
        description="Start building voice-first forms in minutes."
      />

      {message ? <AuthAlert message={message} /> : null}

      <div className="flex flex-col gap-5">
        <Field label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
          <Input
            id="full_name"
            autoComplete="name"
            placeholder="Mike Lamptey"
            invalid={Boolean(errors.full_name)}
            {...register("full_name")}
          />
        </Field>

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
            autoComplete="new-password"
            placeholder="Create a password"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirm password"
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

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Controller
              name="accepted_terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span className="text-body-s leading-5 text-content-secondary">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-content-link">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-content-link">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.accepted_terms ? (
            <p className="text-body-s text-state-danger">{errors.accepted_terms.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={pending || !isLoaded}>
        {pending ? "Creating account…" : "Create Account"}
      </Button>

      <AuthDivider />
      <SocialButtons signIn={socialSignIn} isLoaded={socialLoaded} />
      <AuthFooterLink prompt="Already have an account?" href="/login" label="Log In" />
      <div id="clerk-captcha" />
    </form>
  );
}
