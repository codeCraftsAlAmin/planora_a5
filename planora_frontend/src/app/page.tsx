"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/shared/event-card";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Card, CardBadge, CardDescription, CardTitle } from "@/components/ui/card";
import { eventService, mapBackendEventToFrontend } from "@/lib/api-service";
import type { EventItem } from "@/types";
import { Users, Calendar, Globe, Sparkles, Zap, Award } from "lucide-react";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedEvents() {
      try {
        const res = await eventService.getAllEvents({ isFeatured: true });
        if (res.ok && Array.isArray(res.data)) {
          const mapped = res.data.map(mapBackendEventToFrontend);
          setFeaturedEvents(mapped);
        }
      } catch (error) {
        console.error("Failed to load featured events:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedEvents();
  }, []);

  const heroEvent = featuredEvents[0];
  const gridEvents = featuredEvents.slice(1, 4);

  return (
    <div className="pb-16 pt-8 sm:pt-12 space-y-16">
      <MainWrapper className="space-y-12">
        {/* Hero Section */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,250,240,0.76))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14 transition-all duration-300 hover:shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
            <CardBadge className="bg-[var(--color-primary)] text-white border-none px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 inline" />
              Featured Event
            </CardBadge>
            <div className="mt-6 max-w-2xl space-y-5">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-6 bg-slate-200 rounded-lg w-1/2" />
                </div>
              ) : heroEvent ? (
                <>
                  <h1 className="font-serif text-5xl leading-tight tracking-tight text-[var(--color-surface-950)] sm:text-6xl md:text-7xl">
                    {heroEvent.title}
                  </h1>
                  <p className="max-w-xl text-base leading-relaxed text-[var(--color-copy)] sm:text-lg">
                    {heroEvent.shortDescription}
                  </p>
                </>
              ) : (
                <h1 className="font-serif text-5xl leading-tight text-[var(--color-surface-950)] sm:text-6xl">
                  Host Memorable Events with Planora
                </h1>
              )}
            </div>
            
            {heroEvent && !loading && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <HeroStat label="Date" value={heroEvent.dateLabel} icon={<Calendar className="h-4 w-4" />} />
                <HeroStat label="Organizer" value={heroEvent.organizer} icon={<Users className="h-4 w-4" />} />
                <HeroStat label="Access" value={heroEvent.feeLabel} icon={<Award className="h-4 w-4" />} />
              </div>
            )}
          </div>

          <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] border-none text-white p-2">
            <div className="h-full rounded-[28px] border border-white/10 p-8 flex flex-col justify-between">
              <div>
                <CardBadge className="bg-white/12 text-white border-white/20">Discovery</CardBadge>
                <CardTitle className="text-white text-3xl mt-4 font-serif">The Planora Experience</CardTitle>
                <CardDescription className="text-white/70 mt-2 text-base">
                  Empowering hosts and attendees to build meaningful connections through seamless event management.
                </CardDescription>
              </div>
              <div className="space-y-4 mt-8">
                {[
                  { text: "Dynamic discovery by category & status", icon: <Globe className="h-4 w-4" /> },
                  { text: "Real-time notifications & updates", icon: <Zap className="h-4 w-4" /> },
                  { text: "Secure payments & instant registration", icon: <Award className="h-4 w-4" /> },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3.5 text-sm leading-none text-white/90 hover:bg-white/10 transition-colors cursor-default"
                  >
                    <span className="text-emerald-400">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Featured Categories - New Section */}
        <section className="space-y-8 py-4">
          <div className="text-center space-y-2">
            <CardBadge variant="secondary" className="px-5 py-1">Explore</CardBadge>
            <h2 className="font-serif text-4xl text-[var(--color-surface-950)]">Browse by Category</h2>
            <p className="text-[var(--color-copy-muted)] mx-auto max-w-lg">Find the experiences that matter most to you through our curated selections.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Technology", color: "bg-blue-500", icon: "🚀", count: "12 Events" },
              { name: "Business", color: "bg-emerald-500", icon: "💼", count: "8 Events" },
              { name: "Creative", color: "bg-purple-500", icon: "🎨", count: "15 Events" },
              { name: "Community", color: "bg-orange-500", icon: "🤝", count: "21 Events" },
            ].map((cat) => (
              <div key={cat.name} className="group relative overflow-hidden rounded-[32px] border border-[var(--color-border)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-xl cursor-pointer">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${cat.color} bg-opacity-10`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-[var(--color-surface-950)] text-lg">{cat.name}</h3>
                <p className="text-sm text-[var(--color-copy-muted)] mt-1">{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Featured Events */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-surface-950)]">
                Editor&apos;s Choices
              </h2>
              <p className="text-sm text-[var(--color-copy-muted)] mt-1">
                Hand-picked public events that are making waves this season.
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : gridEvents.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {gridEvents.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-[var(--color-border)] py-20 text-center">
              <p className="text-[var(--color-copy-muted)]">Check back later for featured events.</p>
            </div>
          )}
        </section>

        {/* Platform Stats - New Section */}
        <section className="relative overflow-hidden rounded-[48px] border-none bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] py-20 px-12 transition-all hover:shadow-lg">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500 opacity-20 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400 opacity-20 blur-[80px]" />
          
          <div className="relative grid gap-12 lg:grid-cols-3">
            <StatItem value="2,500+" label="Active Communities" sub="Building together every day" />
            <StatItem value="150K+" label="Events Hosted" sub="From local meetups to global summits" />
            <StatItem value="1M+" label="Tickets Served" sub="Powering seamless event entry" />
          </div>
        </section>
      </MainWrapper>
    </div>
  );
}

function HeroStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-[var(--color-border)] bg-white/80 p-5 backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-copy-muted)]">
          {label}
        </p>
        <p className="font-semibold text-[var(--color-surface-950)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatItem({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="space-y-2 text-center lg:text-left">
      <p className="text-5xl font-bold tracking-tighter text-white">{value}</p>
      <div className="space-y-1">
        <p className="text-lg font-medium text-emerald-400">{label}</p>
        <p className="text-sm text-white/70">{sub}</p>
      </div>
    </div>
  );
}
