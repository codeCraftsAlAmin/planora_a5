"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  gender: z.enum(["male", "female", "other"], {
    error: "Please select a gender.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "male",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 800));

    showToast({
      title: "Registration UI validated",
      description: `${values.name} is ready for backend signup integration.`,
      variant: "success",
    });
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join Planora and start hosting standout events."
      description="Set up your profile with a secure password and a few details. The form is already wired with Zod validation so we can connect your backend next."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Name" error={errors.name?.message}>
          <Input placeholder="Ava Rahman" {...register("name")} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="ava@example.com" {...register("email")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Minimum 8 characters"
            {...register("password")}
          />
        </FormField>

        <FormField label="Gender" error={errors.gender?.message}>
          <select
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
            {...register("gender")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-sm leading-6 text-[var(--color-copy-muted)]">
          By continuing, you agree to Planora&apos;s{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-[var(--color-brand-700)]"
          >
            privacy policy
          </Link>
          .
        </p>
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
