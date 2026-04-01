"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Input } from "@/components/ui/input";
import { eventCategories, eventStatuses, mockEvents } from "@/lib/mock-events";
import type { EventCategory, EventStatus } from "@/types";

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [status, setStatus] = useState<EventStatus | "all">("all");

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockEvents.filter((event) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.organizer.toLowerCase().includes(normalizedQuery);

      const matchesCategory = category === "all" || event.category === category;
      const matchesStatus = status === "all" || event.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, query, status]);

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,250,240,0.82))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            Browse events
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              Discover the next event your community actually wants to attend.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              Search by title or organizer, then narrow the list by category and
              availability status. Each card shows pricing and member capacity
              so visitors can decide fast.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white/88 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Search by title or organizer
              </span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try Planora, Hackers of Dhaka, Canvas Frontier..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Category
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as EventCategory | "all")
                }
                className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
              >
                {eventCategories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Status
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as EventStatus | "all")
                }
                className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
              >
                {eventStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                Public events
              </h2>
              <p className="text-sm text-[var(--color-copy-muted)]">
                {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} match your current filters.
              </p>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--color-border-strong)] bg-white/70 px-6 py-12 text-center">
              <h3 className="font-serif text-2xl text-[var(--color-surface-950)]">
                No events match that search yet
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-copy-muted)]">
                Try a different keyword or reset the category and status filters
                to widen the results.
              </p>
            </div>
          )}
        </section>
      </MainWrapper>
    </div>
  );
}
