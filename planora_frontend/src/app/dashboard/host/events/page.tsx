"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  CalendarDays,
  CalendarX2,
  Trash2,
  Edit2,
  Image as ImageIcon
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { eventService, type BackendEvent } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export default function HostEventsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<BackendEvent | null>(null);
  const [activeModal, setActiveModal] = useState<"CREATE" | "EDIT" | "DELETE" | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    type: "PUBLIC",
    description: "",
    fee: "0",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMyEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();
      if (response.ok && response.data) {
        setEvents(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch your events");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching your events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "HOST") {
        router.push("/");
        return;
      }
      fetchMyEvents();
    }
  }, [currentUser, isAuthPending, fetchMyEvents, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      venue: "",
      type: "PUBLIC",
      description: "",
      fee: "0",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedEvent(null);
    setActiveModal("CREATE");
  };

  const openEditModal = (event: BackendEvent) => {
    setFormData({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      venue: event.venue,
      type: event.type,
      description: event.description || "",
      fee: event.fee.toString(),
    });
    setImageFile(null);
    setImagePreview(event.image || null);
    setSelectedEvent(event);
    setActiveModal("EDIT");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (imageFile) {
        data.append("image", imageFile);
      }

      let res;
      if (activeModal === "CREATE") {
        res = await eventService.createEvent(data);
      } else if (activeModal === "EDIT" && selectedEvent) {
        res = await eventService.updateEvent(selectedEvent.id, data);
      }

      if (res?.ok) {
        showToast({ 
          title: "Success", 
          description: `Event ${activeModal === "CREATE" ? "created" : "updated"} successfully.`, 
          variant: "success" 
        });
        setActiveModal(null);
        fetchMyEvents();
      } else {
        showToast({ title: "Error", description: res?.message || "Operation failed", variant: "error" });
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      setIsActionLoading(true);
      const res = await eventService.deleteEvent(selectedEvent.id);
      if (res.ok) {
        showToast({ title: "Success", description: "Event deleted successfully.", variant: "success" });
        fetchMyEvents();
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
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/60 backdrop-blur-md p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                🎤 Host Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                My Events
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Manage your events, update details or create a new community gathering.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={openCreateModal}
                className="h-11 rounded-2xl px-6 bg-[var(--color-brand-600)]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </section>

        <div className="rounded-[32px] border border-[var(--color-border)] bg-white overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(3)].map((_, i) => (
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
               <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">Could not load events</h3>
               <p className="text-[var(--color-copy-muted)] mx-auto max-w-md">{error}</p>
               <Button variant="outline" onClick={fetchMyEvents} className="rounded-xl">Try Again</Button>
            </div>
          ) : events.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <CalendarDays className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">No events hosted yet</h3>
              <p className="text-[var(--color-copy-muted)]">Click 'Create Event' above to start your first community gathering.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Event Details</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Date & Time</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Status</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Engagement</th>
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
                              <img src={event.image} alt={event.title} className="h-full w-full rounded-xl object-cover shadow-sm bg-slate-100" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col max-w-[300px]">
                            <span className="font-semibold text-[var(--color-surface-950)] truncate">{event.title}</span>
                            <span className="text-xs text-[var(--color-copy-muted)] capitalize">{event.type.toLowerCase()} • {event.fee > 0 ? `৳${event.fee}` : "Free"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-[var(--color-surface-950)]">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-xs text-[var(--color-copy-muted)]">{event.time}</p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={event.status === "CANCELLED" ? "secondary" : "success"} className={event.status === "UPCOMING" ? "bg-amber-100 text-amber-800" : ""}>
                            {event.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="text-sm font-medium text-[var(--color-surface-950)]">{event.totalMembers} / {event.maxMembers || "∞"} joined</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(event)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setActiveModal("DELETE");
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                    <div className="flex w-12 h-12 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm flex-shrink-0">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-base text-red-900">{selectedEvent.title}</p>
                        <p className="text-xs font-medium uppercase mt-0.5 text-red-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </Modal>

        {/* Create / Edit Modal */}
        <Modal
            isOpen={activeModal === "CREATE" || activeModal === "EDIT"}
            onClose={() => setActiveModal(null)}
            title={activeModal === "CREATE" ? "Create New Event" : "Edit Event"}
            description={activeModal === "CREATE" ? "Fill out the details to host a new event." : "Update your event details below."}
            variant="default"
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-4 px-1 max-h-[65vh] overflow-y-auto w-full">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-semibold">Title</label>
                        <Input name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Date</label>
                        <Input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Time</label>
                        <Input name="time" type="time" value={formData.time} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-semibold">Venue</label>
                        <Input name="venue" value={formData.venue} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Type</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                        >
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Fee (৳)</label>
                        <Input name="fee" type="number" min="0" value={formData.fee} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-semibold">Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-semibold">Cover Image</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-1 border-2 border-dashed border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-xl" />
                          ) : (
                            <div className="flex flex-col items-center py-4 text-[var(--color-copy-muted)]">
                                <ImageIcon className="h-8 w-8 mb-2" />
                                <span className="text-sm font-medium">Click to upload image</span>
                            </div>
                          )}
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                    <Button type="button" variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isActionLoading}>
                        {isActionLoading ? "Saving..." : "Save Event"}
                    </Button>
                </div>
            </form>
        </Modal>

      </MainWrapper>
    </div>
  );
}
