"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { reviewsService, type Review } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  eventId: string;
  initialReviews: Review[];
  isLoggedIn: boolean;
  userVerified: boolean;
  userId?: string;
  organizerId: string;
  canRate: boolean;
}

export function CommentSection({
  eventId,
  initialReviews,
  isLoggedIn,
  userVerified,
  userId,
  organizerId,
  canRate,
}: CommentSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { showToast } = useToast();

  const isHost = isLoggedIn && userId === organizerId;
  const hasRated = !!userId && reviews.some((review) => review.userId === userId && review.rating > 0);
  const ratingDisabledReason = !canRate
    ? "Ratings are available only after the event is completed."
    : hasRated
      ? "You have already submitted a rating for this event."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!isLoggedIn) {
      setError("Please log in to post a comment.");
      return;
    }

    if (!userVerified) {
      setError("Please verify your email to post a comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await reviewsService.createReview(eventId, {
        comment: comment.trim(),
        rating: canRate && !hasRated ? rating : 0,
      });

      if (response.ok && response.data) {
        setReviews((prevReviews) => [
          {
            ...response.data,
            user: {
              id: userId || "",
              name: "You",
              image: null,
            },
          },
          ...prevReviews,
        ]);
        setComment("");
        setRating(0);
        showToast({
          title: "Comment posted",
          description:
            canRate && !hasRated && rating > 0
              ? "Your review and rating are now live."
              : "Your review is now live.",
          variant: "success",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyComment.trim()) return;

    try {
      setIsReplying(true);
      setError(null);
      const response = await reviewsService.replyComment(parentId, replyComment.trim());

      if (response.ok && response.data) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === parentId
              ? {
                  ...review,
                  replies: [...(review.replies || []), response.data],
                }
              : review,
          ),
        );
        setReplyingToId(null);
        setReplyComment("");
        showToast({
          title: "Reply posted",
          description: "The user will see your reply notification.",
          variant: "success",
        });
      }
    } catch (err: unknown) {
      showToast({
        title: "Reply failed",
        description: err instanceof Error ? err.message : "Failed to post reply.",
        variant: "error",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleStartEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditedComment(review.comment);
    setError(null);
  };

  const handleCancelEditing = () => {
    setEditingReviewId(null);
    setEditedComment("");
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editedComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      setIsUpdatingReview(true);
      setError(null);
      const response = await reviewsService.updateReview(reviewId, editedComment.trim());

      if (response.ok && response.data) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  comment: response.data.comment,
                  updatedAt: response.data.updatedAt,
                }
              : review,
          ),
        );
        handleCancelEditing();
        showToast({
          title: "Review updated",
          description: "Your comment has been updated successfully.",
          variant: "success",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update review.");
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setDeletingReviewId(reviewId);
      setError(null);
      const response = await reviewsService.deleteReview(reviewId);

      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
        if (editingReviewId === reviewId) {
          handleCancelEditing();
        }
        showToast({
          title: "Review deleted",
          description: "Your comment has been removed.",
          variant: "success",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete review.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <section className="mt-12 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold text-[var(--color-surface-950)]">
          Communal Discussions
        </h2>
        <span className="rounded-full bg-[var(--color-brand-100)] px-3 py-1 text-sm font-semibold text-[var(--color-brand-700)]">
          {reviews.length} {reviews.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      <Card className="overflow-hidden border-none bg-white p-6 shadow-sm ring-1 ring-[var(--color-border)]">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-50)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-surface-950)]">
                    Add a rating
                  </p>
                  <p className="text-xs text-[var(--color-copy-muted)]">
                    Optional. You can rate this event once from 1 to 5 stars.
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-brand-700)]">
                  {rating > 0 ? `${rating}/5` : "No rating"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating((current) => (current === value ? 0 : value))}
                    disabled={!!ratingDisabledReason || isSubmitting}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      value <= rating
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-[var(--color-border)] bg-white text-[var(--color-copy-muted)]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star className={`h-5 w-5 ${value <= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
              {ratingDisabledReason ? (
                <p className="text-xs text-[var(--color-copy-muted)]">{ratingDisabledReason}</p>
              ) : null}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this event..."
              className="min-h-[120px] w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-50)] p-4 text-[var(--color-copy)] transition-all placeholder:text-[var(--color-copy-muted)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
              disabled={isSubmitting}
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="rounded-full px-8"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[var(--color-copy-muted)]">
              Join the conversation. Sign in to share your thoughts.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Log in to Comment
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-lg font-bold text-[var(--color-brand-700)] shadow-sm">
                  {review.user?.name?.[0] || "U"}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-[var(--color-surface-950)]">
                        {review.user?.name || "Anonymous User"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-[var(--color-copy-muted)]">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {review.rating > 0 ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={`${review.id}-star-${index}`}
                                className={`h-3.5 w-3.5 ${index < review.rating ? "fill-current" : "text-slate-300"}`}
                              />
                            ))}
                            <span className="ml-1 text-[11px] font-semibold text-amber-600">
                              {review.rating}/5
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {userId && review.userId === userId ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() => handleStartEditing(review)}
                          disabled={deletingReviewId === review.id}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          {deletingReviewId === review.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {editingReviewId === review.id ? (
                    <div className="space-y-3 rounded-2xl bg-[var(--color-surface-50)] p-4 ring-1 ring-[var(--color-border)]">
                      <textarea
                        value={editedComment}
                        onChange={(event) => setEditedComment(event.target.value)}
                        className="min-h-[100px] w-full resize-none rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-copy)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]/20"
                        disabled={isUpdatingReview}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEditing}
                          disabled={isUpdatingReview}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={isUpdatingReview || !editedComment.trim()}
                        >
                          {isUpdatingReview ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[var(--color-surface-50)] p-4 text-[var(--color-copy)] ring-1 ring-[var(--color-border)] transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                      <p>{review.comment}</p>
                      {review.updatedAt ? (
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-[var(--color-copy-muted)]">
                          Edited
                        </p>
                      ) : null}
                    </div>
                  )}

                  {isHost ? (
                    <div className="flex justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs font-semibold text-[var(--color-brand-600)] hover:bg-transparent hover:text-[var(--color-brand-700)]"
                        onClick={() =>
                          setReplyingToId(replyingToId === review.id ? null : review.id)
                        }
                      >
                        {replyingToId === review.id ? "Cancel Reply" : "Reply to Review"}
                      </Button>
                    </div>
                  ) : null}

                  {replyingToId === review.id ? (
                    <div className="ml-8 mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <textarea
                        value={replyComment}
                        onChange={(e) => setReplyComment(e.target.value)}
                        placeholder="Write your reply..."
                        className="min-h-[80px] w-full resize-none rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]/20"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          disabled={isReplying || !replyComment.trim()}
                          onClick={() => handleReplySubmit(review.id)}
                        >
                          {isReplying ? "Replying..." : "Submit Reply"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {review.replies && review.replies.length > 0 ? (
                    <div className="ml-8 mt-4 space-y-4 border-l-2 border-[var(--color-brand-100)] pl-6">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--color-surface-950)]">
                              {reply.user.name}
                            </span>
                            <span className="rounded bg-[var(--color-brand-50)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-700)]">
                              {reply.user.role}
                            </span>
                            <span className="text-[10px] text-[var(--color-copy-muted)]">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-copy)]">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-50)] text-3xl text-[var(--color-brand-300)]">
              C
            </div>
            <p className="text-[var(--color-copy-muted)]">
              No comments yet. Be the first to start the discussion!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
