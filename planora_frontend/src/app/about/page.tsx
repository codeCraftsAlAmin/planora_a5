import { MainWrapper } from "@/components/shared/main-wrapper";
import { companyProfile } from "@/lib/site-content";

export default function AboutPage() {
  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,248,238,0.88))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            About Planora
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              {companyProfile.tagline}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              {companyProfile.summary}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
              Mission
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-copy)]">
              {companyProfile.mission}
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] lg:col-span-2">
            <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
              Project Snapshot
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-copy)]">
              {companyProfile.story}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Discovery", value: "Search, featured events, and public listings" },
                { label: "Hosting", value: "Create, update, and manage event workflows" },
                { label: "Operations", value: "Invitations, payments, reviews, and admin control" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-50)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-copy)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </MainWrapper>
    </div>
  );
}
