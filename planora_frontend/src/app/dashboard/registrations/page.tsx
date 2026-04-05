"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, RefreshCw, Ticket, Wallet } from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  eventRegisterService,
  type BackendEventRegistration,
} from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusTone(status: BackendEventRegistration["status"]) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  if (status === "BANNED") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function getPaymentTone(status: BackendEventRegistration["paymentStatus"]) {
  if (status === "PAID") return "bg-emerald-50 text-emerald-700";
  if (status === "FREE") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

export default function UserRegistrationsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  const [registrations, setRegistrations] = useState<BackendEventRegistration[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await eventRegisterService.getAllRegistrations();
      if (response.ok && response.data) {
        setRegistrations(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch registrations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "USER") {
        if (currentUser.role === "HOST") {
          router.push("/dashboard/host/registrations");
          return;
        }

        if (currentUser.role === "ADMIN") {
          router.push("/dashboard/admin/registrations");
          return;
        }
      }

      fetchRegistrations();
    }
  }, [currentUser, isAuthPending, router]);

  const summary = useMemo(() => {
    return {
      total: registrations.length,
      approved: registrations.filter((item) => item.status === "APPROVED")
        .length,
      processing: registrations.filter((item) => item.status === "PROCESSING")
        .length,
      paid: registrations.filter((item) => item.paymentStatus === "PAID")
        .length,
    };
  }, [registrations]);

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                Member Dashboard
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                My Registrations
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Track your joined events, approval status, and payment progress in one place.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-2xl px-6"
              onClick={fetchRegistrations}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Total Requests</p>
            <p className="mt-3 font-serif text-4xl text-[var(--color-surface-950)]">{summary.total}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Approved</p>
            <p className="mt-3 font-serif text-4xl text-emerald-700">{summary.approved}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">In Review</p>
            <p className="mt-3 font-serif text-4xl text-amber-700">{summary.processing}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Paid</p>
            <p className="mt-3 font-serif text-4xl text-sky-700">{summary.paid}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--color-copy-muted)]">
              Loading registrations...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-surface-950)]">Could not load registrations</p>
              <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{error}</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <CalendarDays className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-serif font-bold text-[var(--color-surface-950)]">
                No registrations yet
              </h3>
              <p className="mt-2 text-[var(--color-copy-muted)]">
                Join an event and it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:p-6">
              {registrations.map((registration) => (
                <article
                  key={registration.id}
                  className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,247,245,0.9))] p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
                          {registration.event.title}
                        </h2>
                        <Badge className={getStatusTone(registration.status)}>
                          {registration.status}
                        </Badge>
                        <Badge className={getPaymentTone(registration.paymentStatus)}>
                          {registration.paymentStatus}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[var(--color-copy-muted)]">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(registration.event.date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          {registration.event.type}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          {registration.event.fee > 0
                            ? `BDT ${registration.event.fee}`
                            : "Free"}
                        </span>
                      </div>

                      <p className="text-sm text-[var(--color-copy)]">
                        {registration.event.venue} at {registration.event.time}
                      </p>
                    </div>

                    <div className="rounded-[22px] bg-slate-50 px-5 py-4 text-sm text-[var(--color-copy-muted)]">
                      <p>Requested on {formatDate(registration.createdAt)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </MainWrapper>
    </div>
  );
}
