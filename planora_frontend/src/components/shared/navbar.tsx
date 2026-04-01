"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

const demoUser = {
  id: "demo-user",
  name: "Ava Rahman",
  email: "ava@planora.app",
  role: "user" as const,
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isHydrated, setDemoUser } = useAuth();
  const { showToast } = useToast();

  const handleDemoLogin = () => {
    setDemoUser(demoUser);
    showToast({
      title: "Demo session ready",
      description: "Navbar switched to the signed-in state for shell testing.",
      variant: "success",
    });
  };

  const handleLogout = () => {
    setDemoUser(null);
    showToast({
      title: "Signed out",
      description: "Demo auth state has been cleared.",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(245,241,234,0.8)] backdrop-blur-xl">
      <MainWrapper className="py-4">
        <div className="flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 rounded-full border border-[var(--color-border)] bg-white/80 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-copy)] transition hover:bg-[var(--color-surface-100)] hover:text-[var(--color-brand-700)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isHydrated && isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white/90 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-bold text-[var(--color-brand-700)]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="pr-2">
                    <p className="text-sm font-semibold text-[var(--color-surface-950)]">
                      {user.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-copy-muted)]">
                      {user.role}
                    </p>
                  </div>
                  <ButtonLink href="/dashboard" variant="outline" size="sm">
                    Dashboard
                  </ButtonLink>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleDemoLogin}>
                  Login
                </Button>
                <ButtonLink href="/register" variant="primary" size="sm">
                  Register
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-copy)] md:hidden"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 rounded-[28px] border border-[var(--color-border)] bg-white/90 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-copy)] transition hover:bg-[var(--color-surface-100)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
              {isHydrated && isAuthenticated && user ? (
                <>
                  <div className="rounded-2xl bg-[var(--color-surface-100)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-surface-950)]">
                      {user.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-copy-muted)]">
                      {user.role}
                    </p>
                  </div>
                  <ButtonLink href="/dashboard" fullWidth variant="outline">
                    Dashboard
                  </ButtonLink>
                  <Button onClick={handleLogout} variant="ghost" fullWidth>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleDemoLogin} variant="ghost" fullWidth>
                    Login
                  </Button>
                  <ButtonLink href="/register" fullWidth>
                    Register
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </MainWrapper>
    </header>
  );
}
