'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import BlogCard from '@/components/BlogCard';
import { fetchBlogs, Blog } from '@/utils/api';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs().then((data) => {
      setBlogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-12"
      >
        {/* Header Block */}
        <section className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>DevOps Articles</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Engineering Insights
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed font-medium">
            Read detailed breakdowns of secure continuous integrations, network designs, and container orchestration strategies.
          </p>
        </section>

        {/* Blogs Grid */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80 flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground/10" />
                  <div className="w-3/4 h-6 bg-foreground/10 rounded" />
                  <div className="w-full h-4 bg-foreground/10 rounded" />
                  <div className="w-5/6 h-4 bg-foreground/10 rounded" />
                </div>
                <div className="w-20 h-4 bg-foreground/10 rounded" />
              </div>
            ))}
          </section>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto text-text-muted opacity-40 mb-3" />
            <p className="text-text-muted font-medium">No articles found in the repository.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </section>
        )}
      </motion.main>

      <Footer />
    </>
  );
}
