"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { InputOtp } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";

const otpSchema = z.object({
  code: z.string().length(6, "Enter the full 6-digit code."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again later.";
}

function OtpVerificationForm() {
  const { showToast } = useToast();
  const { refetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const email = searchParams.get("email");

  const onSubmit = async (values: OtpFormValues) => {
    if (!email) {
      showToast({
        title: "Missing email",
        description: "Please go back to the registration page and try again.",
        variant: "error",
      });
      return;
    }

    try {
      const response = await authService.verifyOtp({
        email,
        otp: values.code,
      });

      if (!response.ok) {
        showToast({
          title: "Verification failed",
          description: response.message || "Invalid OTP code.",
          variant: "error",
        });
        return;
      }

      await refetch();

      showToast({
        title: "Email verified!",
        description:
          response.message || "You have successfully verified your email.",
        variant: "success",
      });

      // Redirect to dashboard or login
      router.push("/dashboard");
    } catch (err: unknown) {
      showToast({
        title: "Something went wrong",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      const response = await authService.resendOtp({
        email,
        type: "email-verification",
      });

      if (!response.ok) {
        showToast({
          title: "Resend failed",
          description: response.message || "Could not resend code.",
          variant: "error",
        });
        return;
      }

      setSecondsLeft(30);
      setValue("code", "", { shouldValidate: false });
      showToast({
        title: "Code resent",
        description:
          response.message || "A fresh OTP has been sent to your email.",
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Error resending code",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
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
          <p className="text-sm font-semibold text-[var(--color-surface-950)]">
            Verification code
          </p>
          <InputOtp
            value={code}
            onChange={(nextValue) =>
              setValue("code", nextValue, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {errors.code ? (
            <p className="text-sm text-[var(--color-danger-copy)]">
              {errors.code.message}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-copy-muted)]">
              The code expires in 10 minutes for security.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-[var(--color-surface-50)] border border-[var(--color-border)] p-4">
          <p className="text-sm font-medium text-[var(--color-copy)] flex items-center gap-2">
            {secondsLeft > 0 ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-brand-500)]" />
                Wait {secondsLeft}s before requesting a new code
              </>
            ) : (
              <span className="text-[var(--color-brand-600)]">
                You can request a new code now
              </span>
            )}
          </p>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify code"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}
