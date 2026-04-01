import { notFound } from "next/navigation";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBadge, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventBySlug, mockEvents } from "@/lib/mock-events";

export function generateStaticParams() {
  return mockEvents.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const actionLabel = event.feeType === "free" ? "Join Event" : "Pay & Join";
  const relatedEvents = mockEvents
    .filter((item) => item.slug !== event.slug && item.category === event.category)
    .slice(0, 2);

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
              <ButtonLink href="/login" size="lg">
                {actionLabel}
              </ButtonLink>
              <ButtonLink href="/events" variant="outline" size="lg">
                Back to events
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div className={`h-44 bg-gradient-to-br ${event.coverTone}`} />
              <div className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-700)]">
                  Event snapshot
                </p>
                <p className="text-sm leading-7 text-[var(--color-copy)]">
                  This public details screen is intentionally view-only for now.
                  The CTA is ready for the join flow you’ll wire in later.
                </p>
              </div>
            </Card>

            {relatedEvents.length > 0 ? (
              <div className="space-y-4">
                <CardHeader className="px-0">
                  <CardTitle>Similar events</CardTitle>
                  <CardDescription>
                    More public events from the same category.
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  {relatedEvents.map((relatedEvent) => (
                    <EventCard key={relatedEvent.id} event={relatedEvent} compact />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
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
