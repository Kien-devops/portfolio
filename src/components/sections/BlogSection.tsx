import { Blog } from '@/utils/api';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BlogCard from '@/components/BlogCard';

export default function BlogSection({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) return null;

  return (
    <section id="blogs" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
          Latest Articles
        </h2>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
        >
          All Articles
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog, index) => (
          <BlogCard key={blog.id} blog={blog} index={index} />
        ))}
      </div>
    </section>
  );
}
