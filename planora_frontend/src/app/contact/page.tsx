import { MainWrapper } from "@/components/shared/main-wrapper";
import { companyProfile, contactDetails } from "@/lib/site-content";

export default function ContactPage() {
  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(238,248,245,0.88))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
            Contact
          </p>
          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl leading-none tracking-tight text-[var(--color-surface-950)] sm:text-6xl">
              Let&apos;s talk about your next event experience.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-copy)] sm:text-lg">
              Reach the {companyProfile.name} team for platform questions,
              partnership ideas, support requests, or feedback on the product.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
              Contact Details
            </h2>
            <div className="mt-5 space-y-4 text-sm text-[var(--color-copy)]">
              <p>
                <span className="font-semibold text-[var(--color-surface-950)]">
                  Email:
                </span>{" "}
                {contactDetails.email}
              </p>
              <p>
                <span className="font-semibold text-[var(--color-surface-950)]">
                  Phone:
                </span>{" "}
                {contactDetails.phone}
              </p>
              <p>
                <span className="font-semibold text-[var(--color-surface-950)]">
                  Office:
                </span>{" "}
                {contactDetails.address}
              </p>
              <p>
                <span className="font-semibold text-[var(--color-surface-950)]">
                  Support hours:
                </span>{" "}
                {contactDetails.supportHours}
              </p>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <h2 className="font-serif text-2xl text-[var(--color-surface-950)]">
              Mock Response Promise
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-copy)]">
              This page uses mock company data for demo purposes, but the
              structure is ready for real support information, contact forms,
              or CMS-driven content later.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Product walkthrough requests",
                "Host onboarding support",
                "Bug reports and usability feedback",
                "Privacy and account requests",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-50)] px-4 py-3 text-sm text-[var(--color-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </MainWrapper>
    </div>
  );
}
