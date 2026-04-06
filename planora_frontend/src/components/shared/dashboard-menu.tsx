"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type DashboardMenuItem = {
  href: string;
  label: string;
};

const dashboardMenus: Record<UserRole, { label: string; items: DashboardMenuItem[] }> = {
  USER: {
    label: "My Dashboard",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/registrations", label: "My Registrations" },
      { href: "/dashboard/invitations", label: "Invitations" },
    ],
  },
  HOST: {
    label: "Host Dashboard",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/host/events", label: "My Events" },
      { href: "/dashboard/host/registrations", label: "Registrations" },
      { href: "/dashboard/host/invitations", label: "Invitations" },
    ],
  },
  ADMIN: {
    label: "Admin Panel",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/admin/users", label: "Users" },
      { href: "/dashboard/admin/events", label: "Events" },
      { href: "/dashboard/admin/registrations", label: "Registrations" },
      { href: "/dashboard/admin/payments", label: "Payments" },
      { href: "/dashboard/admin/invitations", label: "Invitations" },
    ],
  },
};

interface DashboardMenuProps {
  role: UserRole;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function DashboardMenu({
  role,
  mobile = false,
  onNavigate,
}: DashboardMenuProps) {
  const pathname = usePathname();
  const config = dashboardMenus[role];

  if (mobile) {
    return (
      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-50)] p-3">
        <div className="mb-1 px-2 text-xs font-bold uppercase tracking-wider text-[var(--color-copy-muted)]">
          {config.label}
        </div>
        {config.items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--color-brand-600)] text-white"
                  : "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]",
              )}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  const activeItem =
    config.items.find((item) => pathname === item.href) ?? config.items[0];

  return (
    <div className="group/dashboard relative z-50">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition",
          pathname.startsWith("/dashboard")
            ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
            : "text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]",
        )}
      >
        {activeItem.label}
        <ChevronDown className="h-4 w-4 transition-transform group-hover/dashboard:rotate-180" />
      </button>
      <div className="absolute left-0 top-full hidden min-w-[220px] flex-col gap-1 rounded-2xl border border-[var(--color-border)] bg-white/95 p-2 shadow-[0_10px_25px_rgba(15,23,42,0.1)] backdrop-blur-xl group-hover/dashboard:flex">
        {config.items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--color-brand-600)] text-white"
                  : "text-[var(--color-copy)] hover:bg-[var(--color-surface-100)] hover:text-[var(--color-brand-700)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
