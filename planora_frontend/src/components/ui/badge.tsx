import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "danger" | "purple" | "blue" | "ghost";
}

const badgeVariants = {
  default: "bg-[var(--color-brand-600)] text-white border-transparent",
  secondary: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] border-transparent",
  outline: "border-[var(--color-border)] text-[var(--color-copy)]",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-copy)] border-[var(--color-danger-border)]",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  ghost: "bg-transparent text-[var(--color-copy-muted)] border-transparent",
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
};
