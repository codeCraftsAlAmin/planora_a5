"use client";

import { MainWrapper } from "@/components/shared/main-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardBadge,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const defaultUser = {
  id: "demo-user",
  name: "Ava Rahman",
  email: "ava@planora.app",
  role: "user" as const,
};

export default function ProfilePage() {
  const { user, setDemoUser } = useAuth();
  const { showToast } = useToast();

  const currentUser = user ?? defaultUser;
  const isHost = currentUser.role === "host";

  const handleBecomeHost = () => {
    setDemoUser({ ...currentUser, role: "host" });
    showToast({
      title: "Host mode enabled",
      description: "Your profile has been upgraded for the dashboard demo.",
      variant: "success",
    });
  };

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,213,126,0.18),rgba(255,255,255,0.9))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
            <CardBadge>Profile</CardBadge>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-18 w-18 items-center justify-center rounded-[28px] bg-[var(--color-brand-100)] text-3xl font-bold text-[var(--color-brand-700)]">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-serif text-4xl tracking-tight text-[var(--color-surface-950)]">
                    {currentUser.name}
                  </h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.22em] text-[var(--color-copy-muted)]">
                    {currentUser.role}
                  </p>
                  <p className="mt-3 text-sm text-[var(--color-copy)]">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-copy-muted)]">
                  Account status
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-surface-950)]">
                  {isHost ? "Host access active" : "Attendee access active"}
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--color-copy)]">
              This profile page is where a regular user can upgrade into hosting mode.
              The transition is framed like a clear next step instead of a buried account
              setting, which makes the path easier to discover.
            </p>
          </div>

          <Card className="bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] text-white">
            <CardHeader>
              <CardBadge className="bg-white/12 text-white">Host program</CardBadge>
              <CardTitle className="text-white">Become a Host</CardTitle>
              <CardDescription className="text-white/70">
                Launch private or public events and manage attendees from your own workspace.
              </CardDescription>
            </CardHeader>
            <div className="mt-6 space-y-4">
              {[
                "Create branded event pages with public or private visibility.",
                "Approve or reject requests for invite-only experiences.",
                "Track registrations and revenue from a single dashboard.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-7 text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button
                onClick={handleBecomeHost}
                variant={isHost ? "outline" : "secondary"}
                size="lg"
                className={isHost ? "border-white/25 bg-white/10 text-white hover:bg-white/16" : "w-full"}
                fullWidth={!isHost}
                disabled={isHost}
              >
                {isHost ? "You are already a host" : "Become a Host"}
              </Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              label: "Current role",
              value: isHost ? "Host" : "User",
              detail: "Drives which dashboard modules are shown privately.",
            },
            {
              label: "Next unlock",
              value: isHost ? "Management tools" : "Host dashboard",
              detail: "Approve private attendees and monitor event performance.",
            },
            {
              label: "Recommended path",
              value: isHost ? "Open dashboard" : "Upgrade account",
              detail: "A simple call-to-action keeps the conversion path visible.",
            },
          ].map((item) => (
            <Card key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-copy-muted)]">
                {item.label}
              </p>
              <p className="mt-5 font-serif text-3xl text-[var(--color-surface-950)]">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-copy-muted)]">
                {item.detail}
              </p>
            </Card>
          ))}
        </section>
      </MainWrapper>
    </div>
  );
}
