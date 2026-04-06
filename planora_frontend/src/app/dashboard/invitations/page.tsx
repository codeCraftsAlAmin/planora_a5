"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Ticket,
  Wallet,
  XCircle,
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  authService,
  eventService,
  invitationService,
  type BackendEvent,
} from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/providers/auth-provider";
import type { AuthUser, UserInvitation } from "@/types";

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

function getInvitationTone(status: UserInvitation["status"]) {
  if (status === "ACCEPTED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  if (status === "INTERESTED") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function getInvitationActionConfig(status: UserInvitation["status"]) {
  if (status === "ACCEPTED") {
    return {
      label: "Accepted",
      icon: CheckCircle2,
      variant: "primary" as const,
      className: "bg-emerald-600 hover:bg-emerald-600",
    };
  }

  if (status === "REJECTED") {
    return {
      label: "Rejected",
      icon: XCircle,
      variant: "outline" as const,
      className:
        "border-red-200 bg-red-50 text-red-700 hover:border-red-200 hover:text-red-700",
    };
  }

  if (status === "INTERESTED") {
    return {
      label: "Payment Pending",
      icon: Clock3,
      variant: "outline" as const,
      className:
        "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-200 hover:text-sky-700",
    };
  }

  return null;
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-12 text-center">
      <p className="text-lg font-semibold text-[var(--color-surface-950)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{description}</p>
    </div>
  );
}

export default function UserInvitationsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending, refetch } = useAuthContext();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, eventsRes] = await Promise.all([
        authService.getProfile(),
        eventService.getAllEvents(),
      ]);

      if (!profileRes.ok) {
        throw new Error(profileRes.message || "Failed to load your profile");
      }

      if (!eventsRes.ok) {
        throw new Error(eventsRes.message || "Failed to load events");
      }

      setProfile(profileRes.data);
      setEvents(eventsRes.data ?? []);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load invitations");
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
          router.push("/dashboard/host/invitations");
          return;
        }

        if (currentUser.role === "ADMIN") {
          router.push("/dashboard/admin/invitations");
          return;
        }
      }

      loadPageData();
    }
  }, [currentUser, isAuthPending, router]);

  const invitations = useMemo(
    () => profile?.invitationsRecieved ?? [],
    [profile?.invitationsRecieved],
  );

  const eventMap = useMemo(
    () => new Map(events.map((event) => [event.id, event])),
    [events],
  );

  const summary = useMemo(() => {
    return {
      total: invitations.length,
      pending: invitations.filter((item) => item.status === "PENDING").length,
      interested: invitations.filter((item) => item.status === "INTERESTED").length,
      accepted: invitations.filter((item) => item.status === "ACCEPTED").length,
    };
  }, [invitations]);

  const handleAccept = async (eventId: string) => {
    try {
      setIsActionLoading(`accept-${eventId}`);
      const response = await invitationService.acceptInvitation(eventId);

      if (!response.ok) {
        throw new Error(response.message || "Failed to accept invitation");
      }

      showToast({
        title: "Invitation accepted",
        description: response.data?.paymentUrl
          ? "Redirecting you to payment checkout."
          : "Your invitation has been accepted successfully.",
        variant: "success",
      });

      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return;
      }

      await Promise.all([loadPageData(), refetch()]);
    } catch (err: unknown) {
      showToast({
        title: "Accept failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      setIsActionLoading(`reject-${eventId}`);
      const response = await invitationService.rejectInvitation(eventId);

      if (!response.ok) {
        throw new Error(response.message || "Failed to reject invitation");
      }

      showToast({
        title: "Invitation declined",
        description: "The host has been notified.",
        variant: "success",
      });

      await Promise.all([loadPageData(), refetch()]);
    } catch (err: unknown) {
      showToast({
        title: "Decline failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

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
                My Invitations
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Review private event invitations and respond in one place.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-2xl px-6"
              onClick={loadPageData}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="All Invitations" value={summary.total} tone="text-[var(--color-surface-950)]" />
          <MetricCard label="Pending" value={summary.pending} tone="text-amber-700" />
          <MetricCard label="Payment Needed" value={summary.interested} tone="text-sky-700" />
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
            <EmptyState
              title="No invitations yet"
              description="When a host invites you to an event, it will appear here."
            />
          ) : (
            <div className="grid gap-4 p-5 sm:p-6">
              {invitations
                .slice()
                .sort(
                  (left, right) =>
                    new Date(right.createdAt).getTime() -
                    new Date(left.createdAt).getTime(),
                )
                .map((invitation) => {
                  const event = eventMap.get(invitation.eventId);
                  const isPending = invitation.status === "PENDING";
                  const acceptLoading = isActionLoading === `accept-${invitation.eventId}`;
                  const rejectLoading = isActionLoading === `reject-${invitation.eventId}`;
                  const actionState = getInvitationActionConfig(invitation.status);

                  return (
                    <article
                      key={invitation.id}
                      className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,247,245,0.9))] p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
                              {event?.title || "Event unavailable"}
                            </h2>
                            <Badge className={getInvitationTone(invitation.status)}>
                              {invitation.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-copy-muted)]">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {event ? formatDate(event.date) : "Unknown date"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Ticket className="h-4 w-4" />
                              {event?.type || "Private event"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              {event
                                ? event.fee > 0
                                  ? `BDT ${event.fee}`
                                  : "Free"
                                : "Unknown fee"}
                            </span>
                          </div>

                          <p className="text-sm text-[var(--color-copy)]">
                            {event
                              ? `${event.venue} at ${event.time}`
                              : "Event details are currently unavailable."}
                          </p>
                        </div>

                        <div className="space-y-3 lg:min-w-[230px]">
                          <div className="rounded-[22px] bg-slate-50 px-5 py-4 text-sm text-[var(--color-copy-muted)]">
                            <p>Received on {formatDate(invitation.createdAt)}</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            {isPending ? (
                              <>
                                <Button
                                  onClick={() => handleAccept(invitation.eventId)}
                                  disabled={!!isActionLoading}
                                  className="rounded-2xl"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {acceptLoading ? "Accepting..." : "Accept"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleReject(invitation.eventId)}
                                  disabled={!!isActionLoading}
                                  className="rounded-2xl"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {rejectLoading ? "Declining..." : "Reject"}
                                </Button>
                              </>
                            ) : actionState ? (
                              <Button
                                variant={actionState.variant}
                                disabled
                                className={`rounded-2xl ${actionState.className}`}
                              >
                                <actionState.icon className="mr-2 h-4 w-4" />
                                {actionState.label}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      </MainWrapper>
    </div>
  );
}
