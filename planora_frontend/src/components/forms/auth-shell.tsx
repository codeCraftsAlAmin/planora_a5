import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
}: AuthShellProps) {
  return (
    <Card className="w-full max-w-xl overflow-hidden border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,252,247,0.92))] p-0">
      <div className="border-b border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(248,213,126,0.16),rgba(21,122,104,0.08))] px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-700)]">
          {eyebrow}
        </p>
        <CardHeader className="mt-3 px-0 pb-0">
          <CardTitle className="text-3xl sm:text-4xl">{title}</CardTitle>
          <CardDescription className="max-w-lg text-sm leading-7 sm:text-base">
            {description}
          </CardDescription>
        </CardHeader>
      </div>
      <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-50)] px-6 py-4 text-sm text-[var(--color-copy-muted)] sm:px-8">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-semibold text-[var(--color-brand-700)] transition hover:text-[var(--color-brand-500)]"
        >
          {footerLinkLabel}
        </Link>
      </div>
    </Card>
  );
}
