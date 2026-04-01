import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand-600)] text-white shadow-[0_18px_40px_rgba(10,86,74,0.22)] hover:bg-[var(--color-brand-700)]",
  secondary:
    "bg-[var(--color-accent-500)] text-[var(--color-surface-950)] hover:bg-[var(--color-accent-400)]",
  ghost:
    "bg-transparent text-[var(--color-copy)] hover:bg-[var(--color-surface-100)]",
  outline:
    "border border-[var(--color-border-strong)] bg-white text-[var(--color-copy)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-700)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function getClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth?: boolean,
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getClassName(variant, size, fullWidth, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={getClassName(variant, size, fullWidth, className)}>
      {children}
    </Link>
  );
}
