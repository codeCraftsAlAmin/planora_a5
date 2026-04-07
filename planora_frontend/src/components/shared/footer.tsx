import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { MainWrapper } from "@/components/shared/main-wrapper";
import {
  companyProfile,
  contactDetails,
  footerLinks,
} from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white/85">
      <MainWrapper className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div className="max-w-md space-y-3">
            <Logo />
            <p className="text-sm leading-6 text-[var(--color-copy-muted)]">
              {companyProfile.summary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
              Company
            </h3>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--color-copy)] transition hover:text-[var(--color-brand-700)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
              Contact
            </h3>
            <div className="space-y-2 text-sm leading-6 text-[var(--color-copy-muted)]">
              <p>{contactDetails.email}</p>
              <p>{contactDetails.phone}</p>
              <p>{contactDetails.address}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-copy-muted)]">
          (c) 2026 Planora. Crafted for modern event teams.
        </div>
      </MainWrapper>
    </footer>
  );
}
