'use client';

import { Blog } from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

interface BlogCardProps {
  blog: Blog;
  index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
  const isUrl = (val: string) => /^https?:\/\//i.test(val.trim());

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.15)] transition-all duration-500"
    >
      {/* Blog Visual Header */}
      {isUrl(blog.image_url) ? (
        <figure className="aspect-[16/9] overflow-hidden bg-black/40 border-b border-card-border relative">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </figure>
      ) : (
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <span className={blog.image_url || 'fa-solid fa-book'} />
          </div>
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
            {blog.date}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        {isUrl(blog.image_url) && (
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Article</span>
            </span>
            <span>{blog.date}</span>
          </div>
        )}

        <div className="space-y-2 flex-1">
          <Link href={`/blogs/detail?id=${blog.id}`} className="block group/link">
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover/link:text-accent transition-colors duration-300 line-clamp-2">
              {blog.title}
            </h3>
          </Link>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
            {blog.summary}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/blogs/detail?id=${blog.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider uppercase text-accent hover:text-accent-hover transition-colors group/btn"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
