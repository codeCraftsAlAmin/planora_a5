"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { eventStatuses } from "@/lib/mock-events";
import type {
  EventFeeType,
  EventItem,
  EventStatus,
  EventVisibility,
} from "@/types";
import { eventService, aiSearchService, mapBackendEventToFrontend } from "@/lib/api-service";
import { AISearchBar } from "@/components/shared/ai-search-bar";
import { SearchX } from "lucide-react";

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
        
        let response;
        
        if (debouncedQuery) {
          // Use AI Search if there's a query
          response = await aiSearchService.search(debouncedQuery, currentPage, limit);
        } else {
          // Use regular fetch if no query, applying other filters
          const params: Record<string, string | number | boolean | undefined> = {
            type: visibility === "all" ? undefined : visibility,
            status: status === "all" ? undefined : status,
            feeType: feeType === "all" ? undefined : feeType,
            page: currentPage,
            limit: limit,
          };
          response = await eventService.getAllEvents(params);
        }

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
              Ask our AI to find exactly what you're looking for, or use the filters below to narrow down the best community gatherings.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-2 w-2 rounded-full bg-[var(--color-brand-500)] animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-surface-950)]">
                  AI Event Discovery
                </h3>
              </div>
              <AISearchBar 
                onSearch={(val) => setQuery(val)} 
                initialValue={query} 
              />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-50" />

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-copy-muted)]">
                  Visibility
                </span>
                <select
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(event.target.value as EventVisibility | "all")
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-sm outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-50)]"
                >
                  <option value="all">Any type</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-copy-muted)]">
                  Pricing
                </span>
                <select
                  value={feeType}
                  onChange={(event) =>
                    setFeeType(event.target.value as EventFeeType | "all")
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-sm outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-50)]"
                >
                  <option value="all">Any price</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-copy-muted)]">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as EventStatus | "all")
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-copy)] shadow-sm outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-50)]"
                >
                  {eventStatuses.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                  {debouncedQuery ? "Search Results" : "Explore events"}
                </h2>
                <p className="text-sm text-[var(--color-copy-muted)]">
                  Found {events.length} event
                  {events.length === 1 ? "" : "s"} for your criteria
                </p>
              </div>
            </div>

            {events.length > 0 ? (
              <>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex items-center justify-center gap-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-copy)] transition hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-copy)]">
                      Page <span className="text-[var(--color-brand-600)] font-bold">{currentPage}</span>{" "}
                      of <span className="font-semibold">{totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-copy)] transition hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-[40px] border-2 border-dashed border-[var(--color-border)] bg-white/40 px-6 py-20 text-center backdrop-blur-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
                  <SearchX className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-2xl text-[var(--color-surface-950)]">
                  No events found
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
