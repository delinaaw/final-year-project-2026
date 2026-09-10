"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { RESEND_COOLDOWN_SECONDS } from "@/features/auth/config";
import { useCountdown } from "@/hooks/use-countdown";

export function CheckEmailPanel() {
  const email = useSearchParams().get("email") ?? "your email";
  const { label, isComplete, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => {
      restart();
      toast.success("Reset link sent again");
    },
    onError: () => toast.error("Could not resend the link. Try again."),
  });

  return (
    <div className="flex flex-col gap-8">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-muted">
        <MailCheck className="size-7 text-brand" />
      </span>

      <AuthHeading
        title="Check your email"
        description={`We sent a password reset link to ${email}. The link expires in 30 minutes.`}
      />

      <div className="flex flex-col gap-3">
        <Button size="lg" asChild>
          <a href="mailto:">Open email app</a>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Back to log in
          </Link>
        </Button>
      </div>

      <p className="flex flex-wrap justify-center gap-1.5 text-body-s">
        <span className="text-content-secondary">Didn&apos;t get the email?</span>
        {isComplete ? (
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="focus-ring rounded font-semibold text-content-link"
          >
            {mutation.isPending ? "Sending…" : "Resend link"}
          </button>
        ) : (
          <span className="font-semibold text-content-placeholder">Resend in {label}</span>
        )}
      </p>
    </div>
  );
}
