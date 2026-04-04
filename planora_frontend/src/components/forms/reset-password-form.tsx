"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOtp } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";
import { Suspense } from "react";

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, "Enter the full 6-digit code."),
    newPassword: z.string().min(8, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again later.";
}

function ResetPasswordForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const code = useWatch({
    control,
    name: "code",
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!email) {
      showToast({
        title: "Missing email",
        description: "Please start the recovery process again.",
        variant: "error",
      });
      return;
    }

    try {
      const response = await authService.resetPassword({
        email,
        otp: values.code,
        newPassword: values.newPassword,
      });

      if (!response.ok) {
        showToast({
          title: "Reset failed",
          description: response.message || "Something went wrong.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Account secured!",
        description:
          "Your password has been successfully reset. Please sign in with your new credentials.",
        variant: "success",
      });

      router.push("/login");
    } catch (err: unknown) {
      showToast({
        title: "Something went wrong",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  return (
    <AuthShell
      eyebrow="New password"
      title="Secure your account."
      description="Enter the 6-digit code we sent and choose a strong new password to regain access."
      footerText="Entered the wrong email?"
      footerLinkLabel="Back to login"
      footerHref="/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--color-surface-950)]">
            Recovery code
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
          {errors.code && (
            <p className="text-sm text-[var(--color-danger-copy)]">
              {errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-[var(--color-surface-950)]">
              New password
            </span>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-[var(--color-danger-copy)]">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[var(--color-surface-950)]">
              Confirm password
            </span>
            <Input
              type="password"
              placeholder="Repeat your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-[var(--color-danger-copy)]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
