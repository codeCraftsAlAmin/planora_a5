import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(248,213,126,1),_rgba(10,86,74,1))] text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_16px_40px_rgba(10,86,74,0.3)]">
        P
      </span>
      <span className="flex flex-col">
        <span className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-surface-950)]">
          Planora
        </span>
        <span className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-copy-muted)]">
          Events that feel alive
        </span>
      </span>
    </Link>
  );
}
