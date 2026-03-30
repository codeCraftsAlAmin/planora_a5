import { EventStatus, EventType } from "../../../generated/prisma/enums";

export interface ICreateEventInterface {
  title: string;
  date: string;
  time: string;
  venue: string;
  isFeatured: boolean;
  type: EventType;
  description?: string;
  image?: string;
  fee?: number;
}

export interface IUpdateEventInterface {
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  type?: EventType;
  description?: string;
  image?: string;
  fee?: number;
  status?: EventStatus;
  maxMembers?: number;
}
