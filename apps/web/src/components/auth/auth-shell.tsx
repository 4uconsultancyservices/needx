import Link from 'next/link';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14">
      <Link href="/" className="mx-auto mb-6 flex items-center gap-2.5 group">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] font-display text-lg font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-105">
          N
        </span>
        <div className="flex flex-col">
          <span className="font-display text-2xl font-bold text-ink leading-none">NEEDX</span>
          <span className="text-[9px] font-semibold tracking-wider uppercase text-hope mt-0.5">Hope · Faith · Trust</span>
        </div>
      </Link>
      <div className="card-surface p-8 shadow-card">
        <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-5 text-center text-sm text-ink-soft">{footer}</p>}
    </div>
  );
}
