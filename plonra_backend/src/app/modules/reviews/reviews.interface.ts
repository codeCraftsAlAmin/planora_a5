export interface ICreateReview {
  rating?: number;
  comment?: string;
  eventId: string;
  parentId?: string;
}