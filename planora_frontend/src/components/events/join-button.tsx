"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { eventRegisterService } from "@/lib/api-service";
import type { EventItem } from "@/types";

interface JoinButtonProps {
  event: EventItem;
  isLoggedIn: boolean;
  userId?: string;
}

export function JoinButton({ event, isLoggedIn, userId }: JoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!isLoggedIn) {
      router.push(`/login?returnTo=/events/${event.id}`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await eventRegisterService.registerForEvent(event.id);

      if (response.ok && response.data) {
        if (response.data.paymentUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.data.paymentUrl;
        } else {
          // Success for free events
          alert(
            event.visibility === "PRIVATE"
              ? "Registration request sent! Please wait for host approval."
              : "Successfully joined the event!"
          );
          router.refresh();
        }
      }
    } catch (error: any) {
      alert(error.message || "Failed to register for event");
    } finally {
      setIsLoading(false);
    }
  };

  const isRegistered = userId
    ? event.registrations?.some((r: any) => r.userId === userId)
    : false;

  const actionLabel = isRegistered
    ? event.feeType === "paid" ? "Registered" : "Joined"
    : event.feeType === "paid" ? "Register Event" : "Join Event";

  return (
    <Button
      onClick={handleJoin}
      disabled={isLoading || isRegistered}
      size="lg"
      className="min-w-[160px]"
    >
      {isLoading ? "Processing..." : actionLabel}
    </Button>
  );
}
