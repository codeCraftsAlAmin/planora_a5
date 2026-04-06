"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, RefreshCw } from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invitationService, type AdminInvitation } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInvitationTone(status: AdminInvitation["status"]) {
  if (status === "ACCEPTED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "REJECTED") return "border-red-200 bg-red-50 text-red-800";
  if (status === "INTERESTED") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
      <p className="text-sm text-[var(--color-copy-muted)]">{label}</p>
      <p className={`mt-3 font-serif text-4xl ${tone}`}>{value}</p>
    </div>
  );
}

export default function AdminInvitationsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await invitationService.getAllInvitations();

      if (response.ok && response.data) {
        setInvitations(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch invitations");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to fetch invitations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/");
        return;
      }

      loadInvitations();
    }
  }, [currentUser, isAuthPending, router]);

  const summary = useMemo(() => {
    return {
      total: invitations.length,
      pending: invitations.filter((item) => item.status === "PENDING").length,
      interested: invitations.filter((item) => item.status === "INTERESTED").length,
      accepted: invitations.filter((item) => item.status === "ACCEPTED").length,
    };
  }, [invitations]);

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                Admin Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                Invitation Oversight
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Monitor every invitation across the platform and track response trends.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-2xl px-6"
              onClick={loadInvitations}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="All Invitations" value={summary.total} tone="text-[var(--color-surface-950)]" />
          <MetricCard label="Pending" value={summary.pending} tone="text-amber-700" />
          <MetricCard label="Interested" value={summary.interested} tone="text-sky-700" />
          <MetricCard label="Accepted" value={summary.accepted} tone="text-emerald-700" />
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--color-copy-muted)]">
              Loading invitations...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-surface-950)]">
                Could not load invitations
              </p>
              <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{error}</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <CalendarDays className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-serif font-bold text-[var(--color-surface-950)]">
                No invitations found
              </h3>
              <p className="mt-2 text-[var(--color-copy-muted)]">
                Invitation activity will appear here once hosts start inviting attendees.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Event</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Schedule</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Fee</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Event Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Invite Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--color-surface-950)]">
                            {invitation.event.title}
                          </p>
                          <p className="text-sm text-[var(--color-copy-muted)]">
                            {invitation.event.venue}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--color-copy-muted)]">
                        <p>{formatDate(invitation.event.date)}</p>
                        <p>{invitation.event.time}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--color-copy-muted)]">
                        {invitation.event.fee > 0 ? `BDT ${invitation.event.fee}` : "Free"}
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline">{invitation.event.status}</Badge>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className={`font-bold uppercase tracking-[0.16em] ${getInvitationTone(invitation.status)}`}
                        >
                          {invitation.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--color-copy-muted)]">
                        {formatDate(invitation.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </MainWrapper>
    </div>
  );
}
