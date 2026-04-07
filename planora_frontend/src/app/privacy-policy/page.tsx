import { MainWrapper } from "@/components/shared/main-wrapper";
import { privacyHighlights } from "@/lib/site-content";

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,247,255,0.88))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            Privacy Policy
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              How mock privacy content is presented in Planora.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              This page contains sample privacy copy for the project footer and
              can be replaced later with reviewed legal text for production use.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="space-y-4">
            {privacyHighlights.map((item, index) => (
              <div
                key={item}
                className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-50)] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)]">
                  Section {index + 1}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-copy)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      </MainWrapper>
    </div>
  );
}
