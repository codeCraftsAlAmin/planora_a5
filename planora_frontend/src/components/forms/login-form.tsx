"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 700));

    showToast({
      title: "Login form looks good",
      description: `${values.email} passed the UI validation flow.`,
      variant: "success",
    });
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to manage events, invitations, and approvals."
      description="Use your account credentials to enter the dashboard. This screen is ready for JWT login wiring when you want to connect the API."
      footerText="Need a new account?"
      footerLinkLabel="Register"
      footerHref="/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="ava@example.com" {...register("email")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="Enter your password" {...register("password")} />
        </FormField>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-[var(--color-copy-muted)]">
            <input type="checkbox" className="h-4 w-4 rounded border-[var(--color-border)]" />
            Keep me signed in
          </label>
          <Link href="/verify-otp" className="font-semibold text-[var(--color-brand-700)]">
            Verify OTP
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--color-surface-950)]">
        {label}
      </span>
      {children}
      {error ? <p className="text-sm text-[var(--color-danger-copy)]">{error}</p> : null}
    </label>
  );
}
