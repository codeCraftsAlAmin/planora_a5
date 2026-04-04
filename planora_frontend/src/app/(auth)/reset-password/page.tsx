import ResetPasswordForm from "@/components/forms/reset-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password | Planora",
  description: "Securely reset your password using the recovery code.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading recovery form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
