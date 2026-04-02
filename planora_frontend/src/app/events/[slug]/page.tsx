"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBadge, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService, eventService, mapBackendEventToFrontend } from "@/lib/api-service";
import type { EventItem, AuthUser } from "@/types";
import { JoinButton } from "@/components/events/join-button";
import { cn } from "@/lib/utils";
import { CommentSection } from "@/components/events/comment-section";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch event and user profile in parallel
        const [eventRes, userRes] = await Promise.allSettled([
          eventService.getEventById(slug),
          authService.getProfile(),
        ]);

        if (eventRes.status === "fulfilled" && eventRes.value.ok) {
          setEvent(mapBackendEventToFrontend(eventRes.value.data));
        } else {
          setError("Event not found");
        }

        if (userRes.status === "fulfilled" && userRes.value.ok) {
          setUser(userRes.value.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)]" />
      </div>
    );
  }

  if (error || !event) {
    notFound();
  }

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10">
            <CardBadge>{event.visibility} event</CardBadge>
            <div className="mt-6 space-y-4">
              <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
                {event.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
                {event.description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetaCard label="Date" value={event.dateLabel} />
              <MetaCard label="Time" value={event.timeLabel} />
              <MetaCard label="Venue" value={event.venue} />
              <MetaCard label="Organizer" value={event.organizer} />
              <MetaCard label="Registration fee" value={event.feeLabel} />
              <MetaCard
                label="Members"
                value={`${event.membersJoined}/${event.membersCapacity}`}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <JoinButton event={event} isLoggedIn={!!user} userId={user?.id} />
              <ButtonLink href="/events" variant="outline" size="lg">
                Back to events
              </ButtonLink>
            </div>

            {/* Organizer Section */}
            <div className="mt-12 border-t border-[var(--color-border)] pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-copy-muted)]">
                Organized by
              </h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-lg font-bold text-[var(--color-brand-700)]">
                  {event.organizerName[0]}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--color-surface-950)]">
                    {event.organizerName}
                  </p>
                  <p className="text-sm text-[var(--color-copy-muted)]">
                    {event.organizerEmail || "Verified Organizer"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div
                className={cn("h-44 bg-gradient-to-br", event.coverTone)}
                style={
                  event.image
                    ? {
                        backgroundImage: `url(${event.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              />
              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-700)]">
                    Event snapshot
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-copy-muted)] text-[var(--color-copy)]">
                    Join this event to experience the Planora community. Registrations
                    are managed securely via our host gateway.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
                  <div>
                    <p className="text-xl font-bold text-[var(--color-surface-950)]">
                      {event.totalRegistrations}
                    </p>
                    <p className="text-xs text-[var(--color-copy-muted)] uppercase tracking-wider">
                      Registrations
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--color-surface-950)]">
                      {event.reviews?.length || 0}
                    </p>
                    <p className="text-xs text-[var(--color-copy-muted)] uppercase tracking-wider">
                      Reviews
                    </p>
                  </div>
                </div>

                {/* More Data: Capacity details */}
                <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-copy-muted)]">Availability</span>
                    <span className="font-medium text-[var(--color-surface-950)]">
                      {event.membersCapacity - event.membersJoined} spots left
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-100)]">
                    <div
                      className="h-full bg-[var(--color-brand-600)] transition-all"
                      style={{
                        width: `${Math.min(100, (event.membersJoined / event.membersCapacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[var(--color-brand-50)] border-none shadow-none">
              <div className="p-6">
                <h4 className="font-serif text-xl text-[var(--color-brand-900)]">
                  Planning an event?
                </h4>
                <p className="mt-2 text-sm text-[var(--color-brand-800)] opacity-80">
                  Planora makes it easy to host, manage, and scale your own community
                  gatherings.
                </p>
                <ButtonLink
                  href="/dashboard"
                  variant="outline"
                  className="mt-4 border-[var(--color-brand-200)] bg-white/50"
                  fullWidth
                >
                  Start Hosting
                </ButtonLink>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <CommentSection
            eventId={event.id}
            initialReviews={event.reviews || []}
            isLoggedIn={!!user}
            userVerified={user?.emailVerified || false}
            userId={user?.id}
            organizerId={event.organizerId || ""}
          />
        </section>
      </MainWrapper>
    </div>
  );
}

function MetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-50)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-copy-muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-surface-950)]">
        {value}
      </p>
    </div>
  );
}
