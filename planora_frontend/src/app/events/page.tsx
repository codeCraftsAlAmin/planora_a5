"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Input } from "@/components/ui/input";
import { eventStatuses } from "@/lib/mock-events"; // Removed mockEvents import
import type {
  EventFeeType,
  EventItem,
  EventStatus,
  EventVisibility,
} from "@/types";
import { eventService, mapBackendEventToFrontend } from "@/lib/api-service";

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<EventStatus | "all">("all");
  const [visibility, setVisibility] = useState<EventVisibility | "all">("all");
  const [feeType, setFeeType] = useState<EventFeeType | "all">("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9); // 9 items per page for 3-column layout

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, visibility, status, feeType]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, string | number | boolean | undefined> = {
          searchTerm: debouncedQuery || undefined,
          type: visibility === "all" ? undefined : visibility,
          status: status === "all" ? undefined : status,
          feeType: feeType === "all" ? undefined : feeType,
          page: currentPage,
          limit: limit,
        };

        const response = await eventService.getAllEvents(params);
        if (response.ok && response.data) {
          const mappedEvents = response.data.map(mapBackendEventToFrontend);
          setEvents(mappedEvents);
          if (response.meta) {
            setTotalPages(response.meta.totalPages);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedQuery, visibility, status, feeType, currentPage, limit]);

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
              Search by title or organizer, then narrow the list by visibility,
              category, and availability status. Each card shows real data from
              the Planora gateway.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white/88 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Search
              </span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title or organizer..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Visibility
              </span>
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as EventVisibility | "all")
                }
                className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
              >
                <option value="all">Any type</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-surface-950)]">
                Pricing
              </span>
              <select
                value={feeType}
                onChange={(event) =>
                  setFeeType(event.target.value as EventFeeType | "all")
                }
                className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
              >
                <option value="all">Any price</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
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

        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-[32px] border border-[var(--color-border)] bg-white/50 p-12 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)]" />
            <p className="text-sm font-medium text-[var(--color-copy-muted)]">
              Fetching the latest community events...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-[32px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-12 text-center">
            <h3 className="font-serif text-2xl text-[var(--color-danger-copy)]">
              Something went wrong
            </h3>
            <p className="max-w-md text-sm leading-7 text-[var(--color-danger-copy)] opacity-80">
              {error}. Please check your connection or try again later.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                  Explore events
                </h2>
                <p className="text-sm text-[var(--color-copy-muted)]">
                  {events.length} event
                  {events.length === 1 ? "" : "s"} on this page
                </p>
              </div>
            </div>

            {events.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-copy)] transition hover:bg-[var(--color-brand-50)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-copy)]">
                      Page <span className="font-semibold">{currentPage}</span>{" "}
                      of <span className="font-semibold">{totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-copy)] transition hover:bg-[var(--color-brand-50)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--color-border-strong)] bg-white/70 px-6 py-12 text-center">
                <h3 className="font-serif text-2xl text-[var(--color-surface-950)]">
                  No events match that search yet
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-copy-muted)]">
                  Try a different keyword or reset the category and status
                  filters to widen the results.
                </p>
              </div>
            )}
          </section>
        )}
      </MainWrapper>
    </div>
  );
}
