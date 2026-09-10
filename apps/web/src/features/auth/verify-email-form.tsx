"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { clerkMessage } from "@/features/auth/clerk-errors";
import { RESEND_COOLDOWN_SECONDS } from "@/features/auth/config";
import { useCountdown } from "@/hooks/use-countdown";

export function VerifyEmailForm() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { label, isComplete, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  const address = signUp?.emailAddress ?? "your email";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded || !signUp) return;

    setMessage(null);
    setPending(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        toast.success("Email verified");
        router.push("/forms");
        return;
      }

      setMessage("That code did not complete verification. Try again.");
    } catch (error) {
      setMessage(clerkMessage(error, "That code is not correct"));
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!signUp) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      restart();
      setCode("");
      toast.success("New code sent");
    } catch (error) {
      toast.error(clerkMessage(error, "Could not resend the code"));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <AuthHeading
        title="Verify your email"
        description={`Enter the 6-digit code we sent to ${address}`}
      />

      {message ? <AuthAlert message={message} /> : null}

      <OtpInput value={code} onChange={setCode} invalid={Boolean(message)} autoFocus />

      <Button type="submit" size="lg" disabled={pending || code.length < 6}>
        {pending ? "Verifying…" : "Verify email"}
      </Button>

      <p className="flex flex-wrap justify-center gap-1.5 text-body-s">
        <span className="text-content-secondary">Didn&apos;t receive a code?</span>
        {isComplete ? (
          <button
            type="button"
            onClick={resend}
            className="focus-ring rounded font-semibold text-content-link"
          >
            Resend code
          </button>
        ) : (
          <span className="font-semibold text-content-placeholder">Resend in {label}</span>
        )}
      </p>
    </form>
  );
}
