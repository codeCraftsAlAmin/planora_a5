"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { InputOtp } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const otpSchema = z.object({
  code: z.string().length(6, "Enter the full 6-digit code."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export function OtpVerificationForm() {
  const { showToast } = useToast();
  const [secondsLeft, setSecondsLeft] = useState(30);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const code = useWatch({
    control,
    name: "code",
  });

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [secondsLeft]);

  const onSubmit = async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 700));

    showToast({
      title: "OTP code accepted",
      description: "This verification screen is ready for backend confirmation.",
      variant: "success",
    });
  };

  const handleResend = () => {
    setSecondsLeft(30);
    setValue("code", "", { shouldValidate: false });
    showToast({
      title: "Code resent",
      description: "A fresh OTP has been requested in the UI flow.",
    });
  };

  return (
    <AuthShell
      eyebrow="OTP verification"
      title="Enter the 6-digit code to unlock your session."
      description="We sent a one-time passcode to your email. Paste it in one step or type it digit by digit."
      footerText="Entered the wrong email?"
      footerLinkLabel="Back to login"
      footerHref="/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--color-surface-950)]">Verification code</p>
          <InputOtp
            value={code}
            onChange={(nextValue) =>
              setValue("code", nextValue, { shouldDirty: true, shouldValidate: true })
            }
          />
          {errors.code ? (
            <p className="text-sm text-[var(--color-danger-copy)]">{errors.code.message}</p>
          ) : (
            <p className="text-sm text-[var(--color-copy-muted)]">
              The code expires in 10 minutes for security.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--color-surface-100)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-surface-950)]">Resend code</p>
            <p className="text-sm text-[var(--color-copy-muted)]">
              {secondsLeft > 0
                ? `Try again in ${secondsLeft}s`
                : "You can request a new code now."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={secondsLeft > 0}
          >
            Resend
          </Button>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify code"}
        </Button>
      </form>
    </AuthShell>
  );
}
