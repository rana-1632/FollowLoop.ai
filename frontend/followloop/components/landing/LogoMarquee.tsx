import { logos } from "@/lib/data";

export default function LogoMarquee() {
  const doubled = [...logos, ...logos];
  return (
    <section className="border-y border-border bg-surface/60 py-10">
      <div className="container-page">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Powering follow-up for modern revenue teams
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-16">
            {doubled.map((logo, i) => (
              <span
                key={i}
                className="text-lg font-bold tracking-tight text-ink-muted/50 whitespace-nowrap"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
