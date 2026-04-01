import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/types";

const statusLabels = {
  open: "Open",
  limited: "Limited",
  "closing-soon": "Closing soon",
};

export function EventCard({
  event,
  compact = false,
}: {
  event: EventItem;
  compact?: boolean;
}) {
  const progress = Math.min(
    100,
    Math.round((event.membersJoined / event.membersCapacity) * 100)
  );

  return (
    <Card className="h-full overflow-hidden p-0">
      <div className={cn("h-36 bg-gradient-to-br", event.coverTone, compact && "h-28")}>
        <div className="flex h-full items-start justify-between p-5 text-white">
          <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
            {event.category}
          </span>
          <div className="flex gap-2">
            <Badge tone={event.feeType === "free" ? "soft" : "accent"}>
              {event.feeType === "free" ? "Free" : "Paid"}
            </Badge>
            <Badge tone="dark">{statusLabels[event.status]}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-copy-muted)]">
              {event.dateLabel}
            </p>
            <h3 className="font-serif text-2xl leading-tight text-[var(--color-surface-950)]">
              {event.title}
            </h3>
          </div>
          <p className="text-sm leading-7 text-[var(--color-copy)]">
            {compact ? event.shortDescription : event.shortDescription}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[var(--color-copy-muted)]">
            <span>{event.feeLabel}</span>
            <span>{event.organizer}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-surface-950)]">
                Members joined
              </span>
              <span className="text-[var(--color-copy-muted)]">
                {event.membersJoined}/{event.membersCapacity}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-100)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <ButtonLink href={`/events/${event.slug}`} fullWidth variant="outline">
          View details
        </ButtonLink>
      </div>
    </Card>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "soft" | "accent" | "dark";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        tone === "soft" && "bg-white/15 text-white",
        tone === "accent" && "bg-[var(--color-accent-500)] text-[var(--color-surface-950)]",
        tone === "dark" && "bg-[rgba(20,34,51,0.36)] text-white"
      )}
    >
      {children}
    </span>
  );
}
