"use client";

import { useMemo, useState } from "react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardBadge,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  hostRegistrations,
  hostStats,
  userNotifications,
  userRegisteredEvents,
} from "@/lib/mock-dashboard";

const demoUser = {
  id: "demo-user",
  name: "Ava Rahman",
  email: "ava@planora.app",
  role: "user" as const,
};

export default function DashboardPage() {
  const { user, isAuthenticated, isHydrated, setDemoUser } = useAuth();
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState(hostRegistrations);

  const pendingCount = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.eventType === "Private" && registration.status === "Pending"
      ).length,
    [registrations]
  );

  const handleDemoLogin = () => {
    setDemoUser(demoUser);
    showToast({
      title: "Demo dashboard ready",
      description: "You are now viewing the attendee control center.",
      variant: "success",
    });
  };

  const handleDecision = (registrationId: string, nextStatus: "Approved" | "Rejected") => {
    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === registrationId
          ? { ...registration, status: nextStatus }
          : registration
      )
    );

    showToast({
      title: `Request ${nextStatus.toLowerCase()}`,
      description: "The attendee management table updated for this demo flow.",
      variant: nextStatus === "Approved" ? "success" : "default",
    });
  };

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(246,239,225,0.8))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
            <CardBadge>Private view</CardBadge>
            <div className="mt-6 max-w-2xl space-y-5">
              <h1 className="font-serif text-4xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                {user?.role === "host"
                  ? "Host control center for your events, approvals, and revenue."
                  : "Your event home for registrations, updates, and next steps."}
              </h1>
              <p className="max-w-xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
                {isHydrated && isAuthenticated && user
                  ? `Signed in as ${user.name}. The dashboard layout adapts to your ${user.role} role.`
                  : "Sign into the demo account to preview the attendee dashboard, then upgrade from the profile screen when you want to explore the host workspace."}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isHydrated && isAuthenticated ? (
                <>
                  <ButtonLink href="/profile" size="lg">
                    Open profile
                  </ButtonLink>
                  <ButtonLink href="/events" variant="outline" size="lg">
                    Explore events
                  </ButtonLink>
                </>
              ) : (
                <>
                  <Button onClick={handleDemoLogin} size="lg">
                    Enter as attendee
                  </Button>
                  <ButtonLink href="/profile" variant="outline" size="lg">
                    Preview host upgrade
                  </ButtonLink>
                </>
              )}
            </div>
          </div>

          <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] text-white">
            <CardHeader>
              <CardBadge className="bg-white/12 text-white">
                {user?.role === "host" ? "Host mode" : "Attendee mode"}
              </CardBadge>
              <CardTitle className="text-white">
                {user?.role === "host" ? "Control every moving part" : "Stay ahead of every event"}
              </CardTitle>
              <CardDescription className="text-white/70">
                {user?.role === "host"
                  ? `You currently have ${pendingCount} private approval request${pendingCount === 1 ? "" : "s"} to review.`
                  : "Track approvals, reminders, and invitations from one place."}
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 p-6">
              {(user?.role === "host"
                ? [
                    "See at-a-glance event metrics before opening each workspace",
                    "Review private registrations and make approval decisions quickly",
                    "Move between hosting operations and attendee-facing event pages",
                  ]
                : [
                    "Review your registered events without digging through email",
                    "Check platform notifications in the same private workspace",
                    "Upgrade to host when you're ready to publish your own experiences",
                  ]).map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-7 text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {user?.role === "host" ? (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                  Performance snapshot
                </h2>
                <p className="text-sm text-[var(--color-copy-muted)]">
                  Small cards surface the numbers hosts care about first.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {hostStats.map((stat, index) => (
                  <Card
                    key={stat.id}
                    className={index === 1 ? "bg-[var(--color-surface-950)] text-white" : ""}
                  >
                    <p
                      className={
                        index === 1
                          ? "text-xs font-semibold uppercase tracking-[0.24em] text-white/60"
                          : "text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-copy-muted)]"
                      }
                    >
                      {stat.label}
                    </p>
                    <p
                      className={
                        index === 1
                          ? "mt-5 font-serif text-4xl text-white"
                          : "mt-5 font-serif text-4xl text-[var(--color-surface-950)]"
                      }
                    >
                      {index === 2 ? pendingCount : stat.value}
                    </p>
                    <p
                      className={
                        index === 1
                          ? "mt-3 text-sm text-white/68"
                          : "mt-3 text-sm text-[var(--color-copy-muted)]"
                      }
                    >
                      {stat.detail}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                    Registration management
                  </h2>
                  <p className="text-sm text-[var(--color-copy-muted)]">
                    Review attendees and approve or reject private event requests.
                  </p>
                </div>
                <ButtonLink href="/events" variant="ghost">
                  View live events
                </ButtonLink>
              </div>

              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-[var(--color-surface-100)] text-xs uppercase tracking-[0.2em] text-[var(--color-copy-muted)]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Attendee</th>
                        <th className="px-6 py-4 font-semibold">Event</th>
                        <th className="px-6 py-4 font-semibold">Requested</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration) => {
                        const isPrivatePending =
                          registration.eventType === "Private" &&
                          registration.status === "Pending";

                        return (
                          <tr
                            key={registration.id}
                            className="border-t border-[var(--color-border)] align-top"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-[var(--color-surface-950)]">
                                {registration.attendeeName}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                                {registration.email}
                              </p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-[var(--color-surface-950)]">
                                {registration.eventTitle}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                                {registration.eventType} / {registration.ticketType}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-sm text-[var(--color-copy)]">
                              {registration.requestedAt}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                  registration.status === "Approved"
                                    ? "border border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-copy)]"
                                    : registration.status === "Rejected"
                                      ? "border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-copy)]"
                                      : "border border-[var(--color-border)] bg-[var(--color-surface-100)] text-[var(--color-copy)]"
                                }`}
                              >
                                {registration.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              {isPrivatePending ? (
                                <div className="flex flex-wrap gap-3">
                                  <Button
                                    size="sm"
                                    onClick={() => handleDecision(registration.id, "Approved")}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDecision(registration.id, "Rejected")}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-sm text-[var(--color-copy-muted)]">
                                  No action needed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardBadge>My Registered Events</CardBadge>
                <CardTitle>Everything you&apos;ve joined</CardTitle>
                <CardDescription>
                  A simple list of your current event commitments.
                </CardDescription>
              </CardHeader>
              <div className="mt-6 space-y-4">
                {userRegisteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-50)] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-surface-950)]">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                          {event.dateLabel} / {event.venue}
                        </p>
                        <p className="mt-3 text-sm text-[var(--color-copy)]">
                          Ticket: {event.ticketType}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          event.status === "Confirmed"
                            ? "border border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-copy)]"
                            : "border border-[var(--color-border)] bg-[var(--color-surface-100)] text-[var(--color-copy)]"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(237,247,244,0.86))]">
              <CardHeader>
                <CardBadge>Notifications</CardBadge>
                <CardTitle>Recent updates</CardTitle>
                <CardDescription>
                  Keep track of approvals, reminders, and invitation activity.
                </CardDescription>
              </CardHeader>
              <div className="mt-6 space-y-4">
                {userNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-[24px] border border-[var(--color-border)] bg-white/85 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--color-surface-950)]">
                          {notification.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-copy)]">
                          {notification.description}
                        </p>
                      </div>
                      <span
                        className={`mt-1 inline-flex h-3 w-3 rounded-full ${
                          notification.tone === "success"
                            ? "bg-[var(--color-brand-500)]"
                            : "bg-[var(--color-accent-500)]"
                        }`}
                      />
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
                      {notification.timeLabel}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}
      </MainWrapper>
    </div>
  );
}
