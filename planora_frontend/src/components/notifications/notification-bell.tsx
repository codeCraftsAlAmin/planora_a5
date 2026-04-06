"use client";

import { useEffect, useRef, useState } from "react";
import { BellDot, MessageSquareReply, MessageSquareText } from "lucide-react";
import { notificationService, type Notification } from "@/lib/api-service";
import { Button } from "@/components/ui/button";

function getNotificationMeta(notification: Notification) {
  const isReplyNotification =
    notification.type === "REVIEW_POSTED" &&
    notification.message.toLowerCase().includes("replied to your comment");

  if (isReplyNotification) {
    return {
      label: "Reply",
      icon: MessageSquareReply,
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    };
  }

  if (notification.type === "REVIEW_POSTED") {
    return {
      label: "Review",
      icon: MessageSquareText,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: notification.type.replaceAll("_", " "),
    icon: BellDot,
    tone: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border-[var(--color-brand-100)]",
  };
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.ok && res.data !== undefined) {
        setUnreadCount(Number(res.data));
      }
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getMyNotifications();
      if (res.ok && res.data) {
        setNotifications(res.data);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await notificationService.markAsRead(id);
      if (res.ok) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Notifications are optional UI.
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-copy)] transition-all hover:bg-[var(--color-surface-100)]"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-3 w-[400px] origin-top-right animate-in zoom-in-95 rounded-3xl border border-[var(--color-border)] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.1)] outline-none duration-200 fade-in">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <h3 className="font-serif text-lg font-bold text-[var(--color-surface-950)]">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto pt-2">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)]" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification) => {
                  const meta = getNotificationMeta(notification);
                  const Icon = meta.icon;

                  return (
                    <div
                      key={notification.id}
                      className="group relative flex flex-col gap-2 rounded-2xl p-4 transition-all hover:bg-[var(--color-surface-50)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${meta.tone}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{meta.label}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-copy-muted)]">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="flex-1 text-sm leading-relaxed text-[var(--color-copy)]">
                          {notification.message}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 gap-1.5 rounded-full border border-[var(--color-brand-100)] px-3 text-xs font-semibold text-[var(--color-brand-600)] transition-colors hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Mark as Read</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 text-2xl opacity-20">N</div>
                <p className="text-sm text-[var(--color-copy-muted)]">
                  All caught up! No unread notifications.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
