import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { MainWrapper } from "@/components/shared/main-wrapper";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white/85">
      <MainWrapper className="py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md space-y-3">
            <Logo />
            <p className="text-sm leading-6 text-[var(--color-copy-muted)]">
              Planora helps communities launch, manage, and grow memorable
              events with a clean workflow for hosts, attendees, and admins.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
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
        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-copy-muted)]">
          © 2026 Planora. Crafted for modern event teams.
        </div>
      </MainWrapper>
    </footer>
  );
}
