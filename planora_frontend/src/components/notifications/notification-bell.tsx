"use client";

import { useEffect, useState, useRef } from "react";
import { notificationService, type Notification } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.ok) {
        setUnreadCount(Number(res.data));
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getMyNotifications();
      if (res.ok && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await notificationService.markAsRead(id);
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[400px] origin-top-right rounded-3xl border border-[var(--color-border)] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.1)] outline-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
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
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="group relative flex flex-col gap-1 rounded-2xl p-4 transition-all hover:bg-[var(--color-surface-50)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm leading-relaxed text-[var(--color-copy)] flex-1">
                        {notification.message}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 gap-1.5 px-3 rounded-full text-xs font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] transition-colors border border-[var(--color-brand-100)]"
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
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-copy-muted)]">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 text-2xl opacity-20">📭</div>
                <p className="text-sm text-[var(--color-copy-muted)]">
                  All caught up! No unread notifications.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
