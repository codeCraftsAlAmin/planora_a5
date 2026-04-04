"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  CalendarX2,
  CalendarCheck2,
  Star,
  StarOff,
  Trash2
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { eventService, adminService, type BackendEvent } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export default function AdminEventsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<BackendEvent | null>(null);
  const [activeModal, setActiveModal] = useState<"FEATURED" | "DELETE" | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (searchTerm) params.searchTerm = searchTerm;

      const response = await eventService.getAllEvents(params);
      
      if (response.ok && response.data) {
        setEvents(response.data);
        if (response.meta) setMeta(response.meta);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch events");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchEvents();
    }
  }, [currentUser, isAuthPending, fetchEvents, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleFeatured = async () => {
    if (!selectedEvent) return;
    try {
      setIsActionLoading(true);
      const newFeaturedStatus = !selectedEvent.isFeatured;
      const res = await adminService.updateFeaturedEvent(selectedEvent.id, newFeaturedStatus);
      if (res.ok) {
        showToast({ title: "Success", description: `Event is now ${newFeaturedStatus ? "featured" : "unfeatured"}.` });
        fetchEvents();
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      setIsActionLoading(true);
      const res = await eventService.deleteEvent(selectedEvent.id);
      if (res.ok) {
        showToast({ title: "Success", description: "Event deleted successfully.", variant: "success" });
        fetchEvents();
      } else {
        showToast({ title: "Error", description: res.message, variant: "error" });
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
      setActiveModal(null);
    }
  };

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        {/* Header Section */}
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/60 backdrop-blur-md p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                🛡️ Admin Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                Event Management
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Manage all platform events and select featured ones for the home page.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-copy-muted)]" />
                <Input
                  placeholder="Search by event title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 h-11 rounded-2xl bg-white/80"
                />
              </div>
              
              <Button 
                onClick={fetchEvents}
                className="h-11 rounded-2xl px-6 bg-[var(--color-brand-600)]"
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-slate-100 rounded w-1/3" />
                     <div className="h-3 bg-slate-50 rounded w-1/4" />
                  </div>
                  <div className="h-8 w-24 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-20 text-center space-y-4">
               <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <CalendarX2 className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">Failed to load events</h3>
               <p className="text-[var(--color-copy-muted)] mx-auto max-w-md">{error}</p>
               <Button variant="outline" onClick={fetchEvents} className="rounded-xl">Try Again</Button>
            </div>
          ) : events.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">No events found</h3>
              <p className="text-[var(--color-copy-muted)]">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Event</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Featured</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Organizer</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Date</th>
                    <th className="px-8 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {events.map((event) => (
                    <tr key={event.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            {event.image ? (
                              <img 
                                src={event.image} 
                                alt={event.title} 
                                className="h-full w-full rounded-xl object-cover shadow-sm bg-slate-100"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm">
                                <CalendarDays className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col max-w-[300px]">
                            <span className="font-semibold text-[var(--color-surface-950)] group-hover:text-[var(--color-brand-700)] transition-colors truncate">
                              {event.title}
                            </span>
                            <span className="text-xs text-[var(--color-copy-muted)] lowercase flex items-center gap-1">
                                {event.type} • {event.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                           {event.isFeatured ? (
                               <Badge variant="success" className="bg-amber-100 text-amber-800 border-amber-200">
                                   <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                                   Featured
                               </Badge>
                           ) : (
                               <Badge variant="secondary" className="text-slate-500">
                                   Standard
                               </Badge>
                           )}
                      </td>
                      <td className="px-6 py-5">
                          <div className="text-sm font-medium text-[var(--color-surface-950)]">
                              {event.organizer?.name || "Unknown"}
                          </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-[var(--color-copy-muted)]">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => {
                                setSelectedEvent(event);
                                setActiveModal("FEATURED");
                            }}
                            className={cn(
                                "inline-flex h-8 items-center px-3 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                !event.isFeatured
                                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200" 
                                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                            )}
                          >
                            {!event.isFeatured ? (
                              <><Star className="mr-1.5 h-3.5 w-3.5" /> Feature</>
                            ) : (
                              <><StarOff className="mr-1.5 h-3.5 w-3.5" /> Unfeature</>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setActiveModal("DELETE");
                            }}
                            className="inline-flex h-8 items-center px-3 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && !error && events.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-8 py-5">
              <div className="text-sm text-[var(--color-copy-muted)]">
                Showing <span className="font-semibold text-[var(--color-surface-950)]">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-semibold text-[var(--color-surface-950)]">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-semibold text-[var(--color-surface-950)]">{meta.total}</span> events
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <div className="flex items-center px-4">
                    <span className="text-xs font-semibold text-[var(--color-copy-muted)] uppercase tracking-widest">
                        Page {meta.page} of {meta.totalPages}
                    </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal
            isOpen={activeModal === "FEATURED"}
            onClose={() => setActiveModal(null)}
            title={selectedEvent && !selectedEvent.isFeatured ? "Feature Event" : "Unfeature Event"}
            description={selectedEvent && !selectedEvent.isFeatured 
                ? "Featuring this event will pin it to the home page for all users to see. This helps promote the event and drive more registrations."
                : "Unpinning this event will remove it from the featured section on the home page."
            }
            variant="default"
            footer={
                <>
                    <Button variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleToggleFeatured} 
                        disabled={isActionLoading}
                        className={selectedEvent && !selectedEvent.isFeatured ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-600 hover:bg-slate-700"}
                    >
                        {selectedEvent && !selectedEvent.isFeatured ? "Confirm Feature" : "Confirm Unfeature"}
                    </Button>
                </>
            }
        >
             {selectedEvent && (
                <div className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border",
                    !selectedEvent.isFeatured ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"
                )}>
                    {selectedEvent.image ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={selectedEvent.image} className="w-full h-full object-cover" alt="Event" />
                        </div>
                    ) : (
                        <div className="flex w-16 h-16 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm flex-shrink-0">
                            <CalendarCheck2 className="h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <p className={cn("font-bold text-lg", !selectedEvent.isFeatured ? "text-amber-900" : "text-slate-900")}>{selectedEvent.title}</p>
                        <p className={cn("text-xs font-medium uppercase mt-1", !selectedEvent.isFeatured ? "text-amber-700" : "text-slate-600")}>{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </Modal>

        <Modal
            isOpen={activeModal === "DELETE"}
            onClose={() => setActiveModal(null)}
            title="Delete Event"
            description="Are you sure you want to delete this event? This action cannot be undone."
            variant="danger"
            footer={
                <>
                    <Button variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleDeleteEvent} 
                        disabled={isActionLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete Event
                    </Button>
                </>
            }
        >
             {selectedEvent && (
                <div className="flex items-center gap-4 p-5 rounded-2xl border bg-red-50 border-red-100">
                    <div className="flex w-16 h-16 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm flex-shrink-0">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-red-900">{selectedEvent.title}</p>
                        <p className="text-xs font-medium uppercase mt-1 text-red-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </Modal>
      </MainWrapper>
    </div>
  );
}
