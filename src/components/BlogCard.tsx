import { Blog } from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BlogCardProps {
  blog: Blog;
  index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
  const isUrl = (val: string) => /^https?:\/\//i.test(val?.trim() ?? '');

  return (
    <article
      className="group flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden transition-all duration-350 hover:border-accent/30 hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.1)] animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image header */}
      {isUrl(blog.image_url) ? (
        <figure className="aspect-[16/9] overflow-hidden bg-black/30 relative">
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.03]"
          />
          {/* Date overlay */}
          <span className="absolute top-3 right-3 text-[10px] font-mono bg-black/60 text-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
            {blog.date}
          </span>
        </figure>
      ) : (
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <span className={blog.image_url || 'fa-solid fa-book'} />
          </div>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.14em]">
            {blog.date}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        {isUrl(blog.image_url) && (
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent/70">
            Article
          </span>
        )}

        <div className="flex-1 space-y-2">
          <Link href={`/blogs/detail?id=${blog.id}`}>
            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-250 line-clamp-2">
              {blog.title}
            </h3>
          </Link>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
            {blog.summary}
          </p>
        </div>

        <Link
          href={`/blogs/detail?id=${blog.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors group/btn mt-1"
        >
          <span>Read</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
