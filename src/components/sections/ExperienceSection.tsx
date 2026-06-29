import { TimelineItem } from '@/utils/api';
import { Briefcase, MapPin } from 'lucide-react';

export default function ExperienceSection({ experiences }: { experiences: TimelineItem[] }) {
  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="space-y-10">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
        Professional Timeline
      </h2>

      <div className="space-y-10">
        {experiences.map((exp, idx) => (
          <div
            key={exp.id || idx}
            className="group relative pl-6 border-l border-card-border hover:border-accent/30 transition-colors duration-300"
          >
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card-border bg-background group-hover:border-accent transition-colors duration-300" />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  {exp.role}
                </h3>
                <span className="text-[11px] font-mono text-accent bg-accent/8 px-2 py-0.5 rounded border border-accent/12">
                  {exp.duration}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {exp.company}
                </span>
                {exp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {exp.location}
                  </span>
                )}
              </div>

              <p className="text-sm text-text-muted leading-relaxed max-w-[65ch] pt-1">
                {exp.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
