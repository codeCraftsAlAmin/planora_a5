"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MailPlus, RefreshCw, Search, Send } from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function HostInvitationsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending, refetch } = useAuthContext();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, eventsRes, usersRes] = await Promise.all([
        authService.getProfile(),
        eventService.getMyEvents(),
        authService.getAllUsers({ role: "USER", limit: 100 }),
      ]);

      if (!profileRes.ok) {
        throw new Error(profileRes.message || "Failed to load your profile");
      }

      if (!eventsRes.ok) {
        throw new Error(eventsRes.message || "Failed to load your events");
      }

      if (!usersRes.ok) {
        throw new Error(usersRes.message || "Failed to load users");
      }

      setProfile(profileRes.data);
      setEvents(eventsRes.data ?? []);
      setUsers(usersRes.data ?? []);
      setSelectedEventId((current) => current || eventsRes.data?.[0]?.id || "");
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load invitations workspace");
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

      if (currentUser.role !== "HOST") {
        router.push("/");
        return;
      }

      loadPageData();
    }
  }, [currentUser, isAuthPending, router]);

  const sentInvitations = useMemo(
    () => profile?.invitationsSent ?? [],
    [profile?.invitationsSent],
  );

  const eventMap = useMemo(
    () => new Map(events.map((event) => [event.id, event])),
    [events],
  );

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const existingInvitationKeys = useMemo(
    () => new Set(sentInvitations.map((item) => `${item.eventId}:${item.inviteeId}`)),
    [sentInvitations],
  );

  const filteredUsers = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedTerm ||
        user.name.toLowerCase().includes(normalizedTerm) ||
        user.email.toLowerCase().includes(normalizedTerm);

      return matchesSearch;
    });
  }, [searchTerm, users]);

  const summary = useMemo(() => {
    return {
      total: sentInvitations.length,
      pending: sentInvitations.filter((item) => item.status === "PENDING").length,
      interested: sentInvitations.filter((item) => item.status === "INTERESTED").length,
      accepted: sentInvitations.filter((item) => item.status === "ACCEPTED").length,
    };
  }, [sentInvitations]);

  const handleSendInvitation = async (inviteeId: string) => {
    if (!selectedEventId) {
      showToast({
        title: "Select an event",
        description: "Choose one of your events before sending invitations.",
        variant: "error",
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await invitationService.sendInvitation({
        eventId: selectedEventId,
        inviteeId,
      });

      if (!response.ok) {
        throw new Error(response.message || "Failed to send invitation");
      }

      showToast({
        title: "Invitation sent",
        description: "The guest has been invited successfully.",
        variant: "success",
      });

      await Promise.all([loadPageData(), refetch()]);
    } catch (err: unknown) {
      showToast({
        title: "Send failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                Host Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                Invitations
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Invite verified members to your events and keep track of their responses.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                className="h-11 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                className="h-11 rounded-2xl px-6"
                onClick={loadPageData}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Sent" value={summary.total} tone="text-[var(--color-surface-950)]" />
          <MetricCard label="Pending" value={summary.pending} tone="text-amber-700" />
          <MetricCard label="Interested" value={summary.interested} tone="text-sky-700" />
          <MetricCard label="Accepted" value={summary.accepted} tone="text-emerald-700" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-[var(--color-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-100 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
                    Invite Members
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                    Search active members and send an invitation for the selected event.
                  </p>
                </div>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-copy-muted)]" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name or email"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[var(--color-copy-muted)]">
                Loading invitation workspace...
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-lg font-semibold text-[var(--color-surface-950)]">
                  Could not load invitation tools
                </p>
                <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                title="Create an event first"
                description="You need at least one hosted event before you can send invitations."
              />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                title="No matching users"
                description="Try a different search to find someone to invite."
              />
            ) : (
              <div className="grid gap-4 p-5 sm:p-6">
                {filteredUsers.map((user) => {
                  const invitationKey = `${selectedEventId}:${user.id}`;
                  const alreadyInvited = existingInvitationKeys.has(invitationKey);

                  return (
                    <article
                      key={user.id}
                      className="flex flex-col gap-4 rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,247,245,0.9))] p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-[var(--color-surface-950)]">
                            {user.name}
                          </h3>
                          <Badge variant="outline">{user.emailVerified ? "Verified" : "Unverified"}</Badge>
                        </div>
                        <p className="text-sm text-[var(--color-copy-muted)]">{user.email}</p>
                      </div>

                      <Button
                        onClick={() => handleSendInvitation(user.id)}
                        disabled={isSending || !selectedEventId || alreadyInvited}
                        className="rounded-2xl"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {alreadyInvited ? "Already invited" : isSending ? "Sending..." : "Send invite"}
                      </Button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-[var(--color-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-100 p-6">
              <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                Your latest sent invitations and their current state.
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[var(--color-copy-muted)]">
                Loading recent invitations...
              </div>
            ) : sentInvitations.length === 0 ? (
              <EmptyState
                title="No invitations sent yet"
                description="Your sent invitations will appear here after your first invite."
              />
            ) : (
              <div className="grid gap-4 p-5 sm:p-6">
                {sentInvitations
                  .slice()
                  .sort(
                    (left, right) =>
                      new Date(right.createdAt).getTime() -
                      new Date(left.createdAt).getTime(),
                  )
                  .map((invitation) => {
                    const event = eventMap.get(invitation.eventId);
                    const invitee = userMap.get(invitation.inviteeId);

                    return (
                      <article
                        key={invitation.id}
                        className="rounded-[24px] border border-[var(--color-border)] bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--color-surface-950)]">
                              {event?.title || "Event unavailable"}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                              {invitee?.name || "Guest"}{invitee?.email ? ` - ${invitee.email}` : ""}
                            </p>
                          </div>
                          <Badge className={getInvitationTone(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-copy-muted)]">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {event ? formatDate(event.date) : "Unknown date"}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MailPlus className="h-4 w-4" />
                            Sent {formatDate(invitation.createdAt)}
                          </span>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}
          </div>
        </section>
      </MainWrapper>
    </div>
  );
}
