"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";


const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again later.";
}

export function RegisterForm() {
  const { showToast } = useToast();
  const router = useRouter();
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
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await authService.signUp(values);

      if (!response.ok) {
        showToast({
          title: "Registration failed",
          description: response.message || "Something went wrong.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Account created!",
        description: response.message || "Please check your email for the verification OTP.",
        variant: "success",
      });

      
      // Redirect to verify-otp page with email in query param
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
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
            placeholder="Minimum 6 characters"
            {...register("password")}
          />
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
