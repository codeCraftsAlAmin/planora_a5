import { cn } from "@/lib/utils";
import type { ToastMessage } from "@/types";

const variantClasses = {
  default: "border-[var(--color-border)] bg-white text-[var(--color-copy)]",
  success:
    "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-copy)]",
  error:
    "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-copy)]",
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const variant = toast.variant ?? "default";

  return (
    <div
      className={cn(
        "w-full rounded-3xl border px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)]",
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm opacity-80">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-xs font-semibold uppercase tracking-[0.24em] opacity-60 transition hover:opacity-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
