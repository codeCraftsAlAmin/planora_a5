import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardBadge,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockEvents } from "@/lib/mock-events";

export default function Home() {
  const featuredEvent = mockEvents[0];
  const upcomingEvents = mockEvents.slice(1, 4);

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,250,240,0.76))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
            <CardBadge>Featured event</CardBadge>
            <div className="mt-6 max-w-2xl space-y-5">
              <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
                {featuredEvent.title}
              </h1>
              <p className="max-w-xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
                {featuredEvent.shortDescription}
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HeroStat label="Date" value={featuredEvent.dateLabel} />
              <HeroStat label="Organizer" value={featuredEvent.organizer} />
              <HeroStat label="Fee" value={featuredEvent.feeLabel} />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/events/${featuredEvent.slug}`} size="lg">
                View event
              </ButtonLink>
              <ButtonLink href="/events" variant="outline" size="lg">
                Browse all events
              </ButtonLink>
            </div>
          </div>

          <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] text-white">
            <CardHeader>
              <CardBadge className="bg-white/12 text-white">Discovery</CardBadge>
              <CardTitle className="text-white">Why attendees join</CardTitle>
              <CardDescription className="text-white/70">
                Planora helps visitors understand value before they commit.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 p-6">
              {[
                "Quick browse by title, organizer, category, and status",
                "Transparent pricing with free vs paid badges",
                "Member progress so full events stand out instantly",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-7 text-white/78"
                >
                  {item}
                </div>
              ))}
              <ButtonLink href="/register" variant="secondary" className="w-full">
                Create your account
              </ButtonLink>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                Upcoming public events
              </h2>
              <p className="text-sm text-[var(--color-copy-muted)]">
                A quick preview of what visitors can explore right now.
              </p>
            </div>
            <ButtonLink href="/events" variant="ghost">
              See all events
            </ButtonLink>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      </MainWrapper>
    </div>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-copy-muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-surface-950)]">
        {value}
      </p>
    </div>
  );
}
