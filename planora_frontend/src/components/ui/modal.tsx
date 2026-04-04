"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "danger" | "warning";
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "default",
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-[var(--color-copy-muted)] hover:bg-[var(--color-surface-100)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className={cn(
              "font-serif text-3xl font-bold leading-tight",
              variant === "danger" ? "text-red-600" : "text-[var(--color-surface-950)]"
            )}>
              {title}
            </h2>
            {description && (
              <p className="text-[var(--color-copy-muted)] text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="py-2">
            {children}
          </div>

          {footer && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
