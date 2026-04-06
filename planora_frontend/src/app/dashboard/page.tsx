"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { statsService, type DashboardStats } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";

const COLORS = ["#0b5f52", "#187d68", "#f2cc73", "#c7253d", "#166431", "#a16207"];

function MetricCard({
  label,
  value,
  description,
  accentClassName,
}: {
  label: string;
  value: string | number;
  description: string;
  accentClassName: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
        {label}
      </p>
      <p className={`mt-4 font-serif text-4xl font-bold ${accentClassName}`}>{value}</p>
      <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{description}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isPending: isAuthPending } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthPending) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await statsService.getDashboardStats();

        if (response.ok && response.data) {
          setStats(response.data);
          return;
        }

        setError(response.message || "Failed to fetch stats");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthPending, router, user]);

  const dashboardCopy = useMemo(() => {
    switch (user?.role) {
      case "HOST":
        return {
          eyebrow: "Host Analytics",
          title: "Host Dashboard",
          description: "Track the performance of your events, invitations, reviews, and revenue in one place.",
          chartTitle: "Event Lifecycle",
          chartDescription: "Status distribution across all events on the platform.",
        };
      case "USER":
        return {
          eyebrow: "Member Activity",
          title: "My Dashboard",
          description: "See your joined events, pending invitations, and recent activity at a glance.",
          chartTitle: "Event Lifecycle",
          chartDescription: "Platform-wide event status distribution for the events you explore.",
        };
      default:
        return {
          eyebrow: "Platform Analytics",
          title: "Platform Dashboard",
          description: "A live snapshot of users, events, invitations, engagement, and revenue.",
          chartTitle: "Event Lifecycle",
          chartDescription: "Status distribution across all platform events.",
        };
    }
  }, [user?.role]);

  const metricCards = useMemo(() => {
    if (!stats || !user) {
      return [];
    }

    if (user.role === "USER") {
      return [
        {
          label: "Joined Events",
          value: stats.totalJoinedEvent ?? 0,
          description: "Events where your registration is already approved.",
          accentClassName: "text-[var(--color-surface-950)]",
        },
        {
          label: "Pending Invitations",
          value: stats.totalPendingInvitation ?? 0,
          description: "Private event invites waiting for your response.",
          accentClassName: "text-amber-700",
        },
        {
          label: "Reviews Given",
          value: stats.totalReview ?? 0,
          description: "Reviews you have contributed across attended events.",
          accentClassName: "text-sky-700",
        },
      ];
    }

    if (user.role === "HOST") {
      return [
        {
          label: "My Events",
          value: stats.totalOwnEventCount ?? 0,
          description: "Events created under your host account.",
          accentClassName: "text-[var(--color-surface-950)]",
        },
        {
          label: "Approved Registrations",
          value: stats.totalRegisterCount ?? 0,
          description: "Confirmed attendees across all of your events.",
          accentClassName: "text-[var(--color-brand-700)]",
        },
        {
          label: "Invitations Sent",
          value: stats.totalInvitationCount ?? 0,
          description: "Total invitations issued for your hosted events.",
          accentClassName: "text-sky-700",
        },
        {
          label: "Pending Invitations",
          value: stats.totalPendingInvitationCount ?? 0,
          description: "Invites that guests have not responded to yet.",
          accentClassName: "text-amber-700",
        },
        {
          label: "Completed Events",
          value: stats.totalCompletedEventCount ?? 0,
          description: "Hosted events already marked as completed.",
          accentClassName: "text-emerald-700",
        },
        {
          label: "Revenue",
          value: formatCurrency(stats.totalRevenue ?? 0),
          description: "Paid registration revenue earned from your events.",
          accentClassName: "text-rose-700",
        },
        {
          label: "Reviews Received",
          value: stats.totalReviewCount ?? 0,
          description: "Reviews submitted on the events you organize.",
          accentClassName: "text-violet-700",
        },
      ];
    }

    const totalEvents = (stats.totalPublicEvent ?? 0) + (stats.totalPrivateEvent ?? 0);
    const totalPeople = (stats.totalUserCount ?? 0) + (stats.totalHostCount ?? 0);

    return [
      {
        label: "Community",
        value: totalPeople,
        description: `Users: ${stats.totalUserCount ?? 0} - Hosts: ${stats.totalHostCount ?? 0}`,
        accentClassName: "text-[var(--color-surface-950)]",
      },
      {
        label: "Events",
        value: totalEvents,
        description: `Public: ${stats.totalPublicEvent ?? 0} - Private: ${stats.totalPrivateEvent ?? 0}`,
        accentClassName: "text-amber-700",
      },
      {
        label: "Approved Registrations",
        value: stats.totalApprovedRegister ?? 0,
        description: "Successful registrations confirmed across the platform.",
        accentClassName: "text-emerald-700",
      },
      {
        label: "Invitations",
        value: stats.totalInvitation ?? 0,
        description: `Pending right now: ${stats.totalPendingInvitation ?? 0}`,
        accentClassName: "text-sky-700",
      },
      {
        label: "Reviews",
        value: stats.totalReview ?? 0,
        description: "Community feedback collected from completed experiences.",
        accentClassName: "text-violet-700",
      },
      {
        label: "Revenue",
        value: formatCurrency(stats.totalRevenue ?? 0),
        description: "Total paid volume from successful event registrations.",
        accentClassName: "text-rose-700",
      },
    ];
  }, [stats, user]);

  if (isAuthPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-8">
        <MainWrapper>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)]" />
            <p className="text-sm font-medium text-[var(--color-copy-muted)]">Loading dashboard...</p>
          </div>
        </MainWrapper>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-8">
        <MainWrapper>
          <div className="flex flex-col items-center justify-center space-y-4 rounded-[32px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-12 text-center">
            <h3 className="font-serif text-2xl text-[var(--color-danger-copy)]">Error loading dashboard</h3>
            <p className="max-w-md text-sm leading-7 text-[var(--color-danger-copy)] opacity-80">{error}</p>
          </div>
        </MainWrapper>
      </div>
    );
  }

  if (!stats || !user) {
    return null;
  }

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-10">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,248,235,0.86))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            {dashboardCopy.eyebrow}
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              {dashboardCopy.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              {dashboardCopy.description}
            </p>
          </div>
        </section>

        <section
          className={`grid gap-6 ${
            metricCards.length >= 6 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3"
          }`}
        >
          {metricCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              description={card.description}
              accentClassName={card.accentClassName}
            />
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-surface-950)]">
              {dashboardCopy.chartTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
              {dashboardCopy.chartDescription}
            </p>
            <div className="mt-6 flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: { label: string; value: number }) => `${props.label}: ${props.value}`}
                    outerRadius={88}
                    dataKey="value"
                  >
                    {stats.pieChartData.map((entry, index) => (
                      <Cell key={`${entry.label}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-surface-950)]">
              Monthly Activity
            </h2>
            <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
              Events created per month from your backend stats feed.
            </p>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    }
                    formatter={(value) => [`${value} events`, "Count"]}
                  />
                  <Bar dataKey="count" fill="#0b5f52" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </MainWrapper>
    </div>
  );
}
