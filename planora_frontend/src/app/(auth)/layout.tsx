import type { ReactNode } from "react";
import { MainWrapper } from "@/components/shared/main-wrapper";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="py-10 sm:py-14">
      <MainWrapper>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] p-8 text-white shadow-[0_30px_70px_rgba(15,23,42,0.1)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/65">
              Planora access
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
              A focused auth flow for organizers, attendees, and admins.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/72">
              These screens give your project a clean entry point with strong
              validation, clear feedback, and a UI that already matches the
              brand system from Phase 1.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                title="Secure by design"
                description="Password rules, email checks, and password recovery are already prepared in the UI."
              />
              <FeatureCard
                title="Ready to connect"
                description="Each form is structured so we can attach your existing backend endpoints cleanly."
              />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">{children}</div>
        </div>
      </MainWrapper>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/12 bg-white/8 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-white/70">{description}</p>
    </div>
  );
}
