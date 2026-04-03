"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { statsService, type DashboardStats } from "@/lib/api-service";

const COLORS = [
  "#0b5f52",
  "#187d68",
  "#f2cc73",
  "#c7253d",
  "#166431",
  "#a16207",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await statsService.getDashboardStats();
        if (response.ok && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
        console.error("Stats fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-8">
        <MainWrapper>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)]" />
            <p className="text-sm font-medium text-[var(--color-copy-muted)]">
              Loading dashboard...
            </p>
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
            <h3 className="font-serif text-2xl text-[var(--color-danger-copy)]">
              Error loading dashboard
            </h3>
            <p className="max-w-md text-sm leading-7 text-[var(--color-danger-copy)] opacity-80">
              {error}
            </p>
          </div>
        </MainWrapper>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate totals safely
  const totalEvents = (stats.totalPublicEvent ?? 0) + (stats.totalPrivateEvent ?? 0);
  const totalPeople = (stats.totalUserCount ?? 0) + (stats.totalHostCount ?? 0);
  const totalInteractions = (stats.totalApprovedRegister ?? 0) + (stats.totalReview ?? 0);

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-10">
        {/* Header */}
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,250,240,0.82))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            📊 Analytics
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              Platform Dashboard
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              Real-time metrics for your community events platform.
            </p>
          </div>
        </section>

        {/* Primary Metrics - Community & Events */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Community Card */}
          <div className="rounded-[28px] border-2 border-[var(--color-brand-200)] bg-gradient-to-br from-[var(--color-brand-50)] to-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-700)]">
                  👥 Community
                </p>
                <p className="mt-4 font-serif text-5xl font-bold text-[var(--color-surface-950)]">
                  {totalPeople}
                </p>
                <p className="mt-2 text-sm text-[var(--color-copy-muted)]">
                  Total people in platform
                </p>
              </div>
              <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Users
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalUserCount ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Hosts
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalHostCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div className="rounded-[28px] border-2 border-[#f2cc73] bg-gradient-to-br from-[#fffbf0] to-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a16207]">
                  🎯 Events
                </p>
                <p className="mt-4 font-serif text-5xl font-bold text-[var(--color-surface-950)]">
                  {totalEvents}
                </p>
                <p className="mt-2 text-sm text-[var(--color-copy-muted)]">
                  Total events published
                </p>
              </div>
              <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Public
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalPublicEvent ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Private
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalPrivateEvent ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement & Revenue */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Engagement Card */}
          <div className="rounded-[28px] border-2 border-[#166431] bg-gradient-to-br from-[#f0fdf4] to-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#166431]">
                  💬 Engagement
                </p>
                <p className="mt-4 font-serif text-5xl font-bold text-[var(--color-surface-950)]">
                  {totalInteractions}
                </p>
                <p className="mt-2 text-sm text-[var(--color-copy-muted)]">
                  Total interactions
                </p>
              </div>
              <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Registrations
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalApprovedRegister ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Reviews
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {stats.totalReview ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="rounded-[28px] border-2 border-[#c7253d] bg-gradient-to-br from-[#fef3f2] to-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c7253d]">
                  💰 Revenue
                </p>
                <p className="mt-4 font-serif text-5xl font-bold text-[var(--color-surface-950)]">
                  ৳{(stats.totalRevenue ?? 0).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-[var(--color-copy-muted)]">
                  Total earnings
                </p>
              </div>
              <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Avg per event
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    ৳
                    {totalEvents > 0
                      ? Math.round(
                          (stats.totalRevenue ?? 0) / totalEvents,
                        ).toLocaleString()
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-copy)]">
                    Events with fee
                  </span>
                  <span className="font-semibold text-[var(--color-surface-950)]">
                    {(stats.totalRevenue ?? 0) > 0 ? "Yes" : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations */}
        <div className="rounded-[28px] border-2 border-[#187d68] bg-gradient-to-r from-[#f0fdfb] to-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0b5f52]">
                📧 Invitations
              </p>
              <p className="mt-4 font-serif text-4xl font-bold text-[var(--color-surface-950)]">
                {stats.totalInvitation ?? 0}
              </p>
              <p className="mt-2 text-sm text-[var(--color-copy-muted)]">
                Sent invitation{(stats.totalInvitation ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-[#f0fdfb] px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5f52]">
                Pending
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#c7253d]">
                {stats.totalPendingInvitation ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Event Status Pie Chart */}
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-surface-950)]">
              📈 Event Status
            </h2>
            <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
              Distribution across statuses
            </p>
            <div className="mt-6 flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.label}: ${props.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Activity Bar Chart */}
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-surface-950)]">
              📊 Monthly Activity
            </h2>
            <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
              Events published per month
            </p>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                      });
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => [`${value} events`, "Count"]}
                  />
                  <Bar dataKey="count" fill="#0b5f52" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </MainWrapper>
    </div>
  );
}
