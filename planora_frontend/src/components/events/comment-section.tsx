"use client";

import { useState } from "react";
import { reviewsService, type Review } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  eventId: string;
  initialReviews: Review[];
  isLoggedIn: boolean;
  userVerified: boolean;
  userId?: string;
  organizerId: string;
}

export function CommentSection({
  eventId,
  initialReviews,
  isLoggedIn,
  userVerified,
  userId,
  organizerId,
}: CommentSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const isHost = isLoggedIn && userId === organizerId;

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
        rating: 0,
      });

      if (response.ok && response.data) {
        setReviews([response.data, ...reviews]);
        setComment("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyComment.trim()) return;

    try {
      setIsReplying(true);
      const response = await reviewsService.replyComment(parentId, replyComment.trim());

      if (response.ok && response.data) {
        // Update the reviews list with the new reply
        setReviews(
          reviews.map((r) => {
            if (r.id === parentId) {
              return {
                ...r,
                replies: [...(r.replies || []), response.data! as any],
              };
            }
            return r;
          })
        );
        setReplyingToId(null);
        setReplyComment("");
      }
    } catch (err: any) {
      alert(err.message || "Failed to post reply.");
    } finally {
      setIsReplying(false);
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

      {/* Comment Form */}
      <Card className="overflow-hidden border-none bg-white p-6 shadow-sm ring-1 ring-[var(--color-border)]">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this event..."
              className="min-h-[120px] w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-50)] p-4 text-[var(--color-copy)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all placeholder:text-[var(--color-copy-muted)]"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
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
              onClick={() => (window.location.href = "/login")}
            >
              Log in to Comment
            </Button>
          </div>
        )}
      </Card>

      {/* Reviews List */}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[var(--color-surface-950)]">
                        {review.user?.name || "Anonymous User"}
                      </h4>
                      <p className="text-xs text-[var(--color-copy-muted)]">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface-50)] p-4 text-[var(--color-copy)] ring-1 ring-[var(--color-border)] group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                    {review.comment}
                  </div>

                  {/* Reply Action */}
                  {isHost && (
                    <div className="flex justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs font-semibold text-[var(--color-brand-600)] hover:bg-transparent hover:text-[var(--color-brand-700)]"
                        onClick={() => setReplyingToId(replyingToId === review.id ? null : review.id)}
                      >
                        {replyingToId === review.id ? "Cancel Reply" : "Reply to Review"}
                      </Button>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingToId === review.id && (
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
                  )}

                  {/* Replies List */}
                  {review.replies && review.replies.length > 0 && (
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
                              • {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-copy)]">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-50)] text-3xl text-[var(--color-brand-300)]">
              💬
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
