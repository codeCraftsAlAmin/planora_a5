import type { AuthUser } from "@/types";

const BASE_URL =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000"}/api/v1`
    : "/api/v1";

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignUpPayload extends AuthCredentials {
  name: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface ResendOtpPayload {
  email: string;
  type?: string;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function getErrorMessage(body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return null;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    ...options.headers,
  } as Record<string, string>;

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Essential for handling cookies
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJsonResponse = contentType.includes("application/json");
  const rawBody = await response.text();
  const body: unknown = rawBody && isJsonResponse ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    if (response.status === 404 && !isJsonResponse) {
      throw new Error(
        "API route not found. Check NEXT_PUBLIC_BACKEND_URL and restart the Next.js dev server so proxy rewrites are enabled.",
      );
    }

    throw new Error(
      getErrorMessage(body) ||
        `API request failed with status ${response.status}.`,
    );
  }

  return (body ?? {
    ok: true,
    message: "",
    data: null,
  }) as ApiResponse<T>;
}

export const authService = {
  signUp: (data: SignUpPayload) =>
    apiFetch<unknown>("/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signIn: (data: AuthCredentials) =>
    apiFetch<unknown>("/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: VerifyOtpPayload) =>
    apiFetch<unknown>("/auth/email-otp/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendOtp: (data: ResendOtpPayload) =>
    apiFetch<unknown>("/auth/email-otp/send-verification-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signOut: () =>
    apiFetch<unknown>("/auth/sign-out", {
      method: "POST",
    }),

  getProfile: () => apiFetch<AuthUser>("/users/my-profile"),

  updateProfile: (formData: FormData) =>
    apiFetch<unknown>("/users/update/my-profile", {
      method: "PUT",
      body: formData,
    }),

  becomeHost: () =>
    apiFetch<unknown>("/users/become-host", {
      method: "PUT",
    }),

  getAllUsers: (params?: QueryParams) => {
    const filteredParams = Object.entries(params ?? {}).reduce<
      Record<string, string>
    >((accumulator, [key, value]) => {
      if (value !== undefined) {
        accumulator[key] = String(value);
      }

      return accumulator;
    }, {});
    const searchParams = new URLSearchParams(filteredParams).toString();
    return apiFetch<unknown>(`/users/?${searchParams}`);
  },
};

export interface BackendEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  isFeatured: boolean;
  type: "PUBLIC" | "PRIVATE";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  description: string | null;
  image: string | null;
  fee: number;
  maxMembers: number;
  totalMembers: number;
  organizer?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
  };
  reviews?: Review[];
  eventsRegistrations?: any[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  eventId: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  replies?: Array<{
    id: string;
    comment: string;
    createdAt: string;
    user: {
      name: string;
      role: string;
    };
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export function mapBackendEventToFrontend(
  event: BackendEvent,
): import("@/types").EventItem {
  // Format date
  const dateObj = new Date(event.date);
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: event.id,
    slug: event.id, // Using ID as slug since backend doesn't have slug
    title: event.title,
    shortDescription: event.description?.substring(0, 100) + "..." || "",
    description: event.description || "",
    organizer: event.organizer?.name || "Unknown Organizer",
    dateLabel,
    timeLabel: event.time,
    venue: event.venue,
    visibility: event.type,
    feeType: event.fee > 0 ? "paid" : "free",
    feeLabel: event.fee > 0 ? `৳${event.fee}` : "Free",
    category: "community", // Default category since backend lacks it
    status: event.status,
    membersJoined: event.totalMembers,
    membersCapacity: event.maxMembers,
    coverTone: "from-[#0b5f52] via-[#187d68] to-[#f2cc73]", // Default tone
    image: event.image || undefined,
    organizerName: event.organizer?.name || "Unknown Organizer",
    organizerEmail: event.organizer?.email,
    organizerId: event.organizer?.id,
    organizerImage: event.organizer?.image || undefined,
    reviews: event.reviews || [],
    totalRegistrations: event.eventsRegistrations?.length || 0,
    registrations: event.eventsRegistrations || [],
  };
}

export const eventService = {
  getAllEvents: (params?: QueryParams) => {
    const filteredParams = Object.entries(params ?? {}).reduce<
      Record<string, string>
    >((accumulator, [key, value]) => {
      if (value !== undefined) {
        accumulator[key] = String(value);
      }
      return accumulator;
    }, {});
    const searchParams = new URLSearchParams(filteredParams).toString();
    return apiFetch<BackendEvent[]>(`/events/?${searchParams}`);
  },

  getMyEvents: () => apiFetch<BackendEvent[]>("/events/my-event"),

  getEventById: async (id: string) => {
    // Workaround since backend doesn't have a direct /events/:id endpoint
    // We fetch all events and find the one with the matching ID
    const res = await eventService.getAllEvents();
    if (res.ok && Array.isArray(res.data)) {
      const event = res.data.find((e) => e.id === id);
      if (event) {
        return {
          ok: true,
          message: "Event found successfully",
          data: event,
        };
      }
    }

    return {
      ok: false,
      message: "Event not found",
      data: null as any,
    };
  },
};

export const eventRegisterService = {
  registerForEvent: (id: string) =>
    apiFetch<{ result: any; paymentUrl: string | null }>(
      `/event-register/register/${id}`,
      {
        method: "POST",
      },
    ),

  getMyRegistrations: () => apiFetch<any[]>("/event-register"),
};

export const reviewsService = {
  createReview: (eventId: string, data: { comment: string; rating?: number }) =>
    apiFetch<Review>(`/reviews/create/${eventId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  replyComment: (parentId: string, comment: string) =>
    apiFetch<Review>(`/reviews/reply/${parentId}`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    }),

  getAllReviews: () => apiFetch<Review[]>("/reviews"),
};

export const notificationService = {
  getMyNotifications: () =>
    apiFetch<Notification[]>("/notifications/my-notifications"),

  markAsRead: (id: string) =>
    apiFetch<Notification>(`/notifications/mark-as-read/${id}`, {
      method: "PUT",
    }),

  getUnreadCount: () =>
    apiFetch<number>("/notifications/my-unread-notifications-count"),
};
