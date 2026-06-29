import { TimelineItem } from '@/utils/api';

export default function CertificationSection({ certifications }: { certifications: TimelineItem[] }) {
  if (certifications.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Industry Certifications
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4">
        {certifications.map((cert) => (
          <a
            key={cert.id}
            href={cert.badge_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group snap-start flex-none flex items-center gap-4 px-5 py-4 rounded-xl border border-card-border bg-card hover:border-accent/35 transition-all duration-300 w-72"
          >
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <span className="group-hover:scale-105 transition-transform">
                <i className={cert.icon || 'fa-brands fa-aws text-2xl text-orange-400'} />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                {cert.title}
              </p>
              <p className="text-[11px] text-text-muted font-mono mt-0.5 truncate">
                {cert.issuer}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
