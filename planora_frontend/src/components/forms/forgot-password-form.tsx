"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again later.";
}

export function ForgotPasswordForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await authService.requestPasswordReset(values.email);

      if (!response.ok) {
        showToast({
          title: "Request failed",
          description: response.message || "Something went wrong.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Code sent!",
        description: "Please check your email for the recovery code.",
        variant: "success",
      });

      // Redirect to reset password page with email in query
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
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
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter your email address and we'll send you a 6-digit code to reset your account."
      footerText="Remembered your password?"
      footerLinkLabel="Back to login"
      footerHref="/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-[var(--color-surface-950)]">
            Email address
          </span>
          <Input 
            type="email" 
            placeholder="ava@example.com" 
            {...register("email")} 
          />
          {errors.email && (
            <p className="text-sm text-[var(--color-danger-copy)]">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending code..." : "Send recovery code"}
        </Button>
      </form>
    </AuthShell>
  );
}
