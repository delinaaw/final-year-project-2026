"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { authApi } from "@/features/auth/api";
import { RESEND_COOLDOWN_SECONDS } from "@/features/auth/config";
import { verifyEmailSchema } from "@/features/auth/schemas";
import { useAuthError } from "@/features/auth/use-auth-error";
import { useCountdown } from "@/hooks/use-countdown";
import { useSession } from "@/hooks/use-session";
import { queryKeys } from "@/lib/query-keys";

export function VerifyEmailForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const [code, setCode] = useState("");
  const { message, capture, clear } = useAuthError();
  const { label, isComplete, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  const verify = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (verified) => {
      queryClient.setQueryData(queryKeys.session, verified);
      toast.success("Email verified");
      router.push("/forms");
    },
    onError: capture,
  });

  const resend = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      restart();
      setCode("");
      toast.success("New code sent");
    },
    onError: () => toast.error("Could not resend the code"),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    clear();
    const parsed = verifyEmailSchema.safeParse({ code });
    if (!parsed.success) {
      capture(new Error(parsed.error.issues[0]?.message));
      return;
    }
    verify.mutate(parsed.data);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <AuthHeading
        title="Verify your email"
        description={`Enter the 6-digit code we sent to ${user?.email ?? "your email"}`}
      />

      {message ? <AuthAlert message={message} /> : null}

      <OtpInput value={code} onChange={setCode} invalid={Boolean(message)} autoFocus />

      <Button type="submit" size="lg" disabled={verify.isPending || code.length < 6}>
        {verify.isPending ? "Verifying…" : "Verify email"}
      </Button>

      <p className="flex flex-wrap justify-center gap-1.5 text-body-s">
        <span className="text-content-secondary">Didn&apos;t receive a code?</span>
        {isComplete ? (
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="focus-ring rounded font-semibold text-content-link"
          >
            {resend.isPending ? "Sending…" : "Resend code"}
          </button>
        ) : (
          <span className="font-semibold text-content-placeholder">Resend in {label}</span>
        )}
      </p>
    </form>
  );
}
