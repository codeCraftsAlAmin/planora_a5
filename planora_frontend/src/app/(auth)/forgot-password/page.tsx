import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Planora",
  description: "Request a password reset code for your Planora account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
