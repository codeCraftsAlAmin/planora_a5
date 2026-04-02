export type UserRole = "admin" | "user" | "host";

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
}


export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

export type EventVisibility = "public" | "private";
export type EventFeeType = "free" | "paid";
export type EventStatus = "open" | "limited" | "closing-soon";
export type EventCategory =
  | "technology"
  | "business"
  | "community"
  | "education"
  | "creative";

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
  membersJoined: number;
  membersCapacity: number;
  coverTone: string;
}
