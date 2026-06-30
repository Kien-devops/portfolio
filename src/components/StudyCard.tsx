import { Study } from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import { Play, PlayCircle, BookOpen } from 'lucide-react';

interface StudyCardProps {
  study: Study;
  index: number;
}

export default function StudyCard({ study, index }: StudyCardProps) {
  const isUrl = (val: string) => /^https?:\/\//i.test(val.trim());

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.15)] transition-all duration-500 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Course Image / Visual Banner */}
      {isUrl(study.image_url) ? (
        <figure className="aspect-[16/9] overflow-hidden bg-black/40 border-b border-card-border relative">
          <Image
            src={study.image_url}
            alt={study.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
          </div>
        </figure>
      ) : (
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <i className={study.image_url || 'fa-solid fa-graduation-cap text-lg'} />
          </div>
          <span className="text-[11px] font-mono text-accent uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 font-bold">
            Free Course
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted uppercase tracking-widest">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-foreground/5 text-accent font-semibold border border-card-border">
            {study.category || 'DevOps'}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span>{study.lessons_count || 0} Lessons</span>
          </span>
        </div>

        <div className="space-y-2 flex-1">
          <Link href={`/study/detail?id=${study.id}`} className="block group/link">
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover/link:text-accent transition-colors duration-300 line-clamp-2">
              {study.title}
            </h3>
          </Link>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
            {study.summary}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/study/detail?id=${study.id}`}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-md shadow-accent/10 group/btn"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Learning</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
