import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-[var(--color-copy-muted)] focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]",
        className
      )}
      {...props}
    />
  );
}
