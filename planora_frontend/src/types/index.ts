export type UserRole = "ADMIN" | "USER" | "HOST";
export type InvitationStatus =
  | "PENDING"
  | "INTERESTED"
  | "ACCEPTED"
  | "REJECTED";

export interface UserInvitation {
  id: string;
  status: InvitationStatus;
  eventId: string;
  inviterId: string;
  inviteeId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  bio?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  image?: string;
  emailVerified?: boolean;
  status?: string;
  createdAt?: string;
  events?: Array<{ id: string }>;
  invitationsSent?: UserInvitation[];
  invitationsRecieved?: UserInvitation[];
}


export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

export type EventVisibility = "PUBLIC" | "PRIVATE";
export type EventFeeType = "free" | "paid";
export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type EventCategory =
  | "technology"
  | "business"
  | "community"
  | "education"
  | "creative";

import { Review } from "@/lib/api-service";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  organizer: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  visibility: EventVisibility;
  feeType: EventFeeType;
  feeLabel: string;
  category: EventCategory;
  status: EventStatus;
  isFeatured?: boolean;
  membersJoined: number;
  membersCapacity: number;
  coverTone: string;
  image?: string;
  organizerName: string;
  organizerEmail?: string;
  organizerId?: string;
  organizerImage?: string;
  reviews?: Review[];
  totalRegistrations?: number;
  registrations?: any[];
}
