"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function ChangePasswordForm() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const response = await authService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (response.ok) {
        showToast({
          title: "Password updated",
          description: "Your password has been successfully changed.",
          variant: "success",
        });
        reset();
      }
    } catch (err: unknown) {
      showToast({
        title: "Update failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--color-surface-950)] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--color-copy-muted)]" />
          Current password
        </label>
        <Input
          type="password"
          placeholder="Enter current password"
          {...register("oldPassword")}
        />
        {errors.oldPassword && (
          <p className="text-xs text-[var(--color-danger-copy)]">
            {errors.oldPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-surface-950)]">
            New password
          </label>
          <Input
            type="password"
            placeholder="Min. 6 characters"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-[var(--color-danger-copy)]">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-surface-950)]">
            Confirm new password
          </label>
          <Input
            type="password"
            placeholder="Repeat new password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-[var(--color-danger-copy)]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Save new password"
        )}
      </Button>
    </form>
  );
}
