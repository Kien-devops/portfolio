'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import CommentsSection from '@/components/CommentsSection';
import { fetchBlogDetail, Blog } from '@/utils/api';
import { ChevronLeft, Calendar, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogDetailClientProps {
  id: string;
}

const isHtmlContent = (content: string) => {
  const trimmed = content.trim();
  return trimmed.startsWith('<') || trimmed.includes('<!DOCTYPE') || trimmed.includes('<html');
};

function SafeHtmlRenderer({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    const handleResize = () => {
      if (iframe && doc.documentElement) {
        iframe.style.height = `${doc.documentElement.scrollHeight}px`;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (doc.body) {
      resizeObserver.observe(doc.body);
    }

    iframe.addEventListener('load', handleResize);
    const timer = setTimeout(handleResize, 300);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      if (iframe) {
        iframe.removeEventListener('load', handleResize);
      }
    };
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0 overflow-hidden bg-white rounded-2xl shadow-sm"
      scrolling="no"
      title="Blog Content"
    />
  );
}

function renderMarkdown(content: string) {
  if (!content) return null;

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const code = codeLines.join('\n');
        codeLines = [];
        renderedElements.push(
          <pre
            key={`code-${idx}`}
            className="bg-black/50 border border-card-border rounded-xl p-4 font-mono text-xs overflow-x-auto text-text-muted my-6 select-all"
          >
            <code>{code}</code>
          </pre>
        );
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.trim().startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${idx}`} className="text-xl font-bold text-foreground mt-8 mb-4">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    if (line.trim().startsWith('- ')) {
      renderedElements.push(
        <li key={`li-${idx}`} className="text-sm md:text-base text-text-muted list-disc ml-5 mb-2 font-medium">
          {line.replace('- ', '')}
        </li>
      );
      return;
    }

    if (line.trim() === '') {
      renderedElements.push(<div key={`space-${idx}`} className="h-4" />);
      return;
    }

    renderedElements.push(
      <p key={`p-${idx}`} className="text-sm md:text-base text-text-muted leading-relaxed font-medium mb-4">
        {line}
      </p>
    );
  });

  return renderedElements;
}

export default function BlogDetailClient({ id }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchBlogDetail(id).then((data) => {
      setBlog(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <BackgroundGlows />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 space-y-12 animate-pulse">
          <div>
            <div className="w-28 h-4 bg-foreground/10 rounded" />
          </div>
          <div className="space-y-6">
            <div className="w-3/4 h-12 bg-foreground/10 rounded" />
            <div className="flex gap-4">
              <div className="w-20 h-4 bg-foreground/10 rounded" />
              <div className="w-20 h-4 bg-foreground/10 rounded" />
              <div className="w-20 h-4 bg-foreground/10 rounded" />
            </div>
            <div className="w-full h-24 bg-foreground/10 rounded-xl" />
            <div className="space-y-4 pt-6">
              <div className="w-full h-4 bg-foreground/10 rounded" />
              <div className="w-5/6 h-4 bg-foreground/10 rounded" />
              <div className="w-4/5 h-4 bg-foreground/10 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <BackgroundGlows />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-40 pb-20 text-center space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
          <p className="text-text-muted">The requested article could not be retrieved from the repository.</p>
          <div className="pt-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 space-y-12"
      >
        {/* Back Link */}
        <div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-xs font-mono text-text-muted hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>BACK TO ARTICLES</span>
          </Link>
        </div>

        {/* Post Title & Metadata */}
        <article className="space-y-6 border-b border-card-border pb-10">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>{blog.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                <span>Kien Devops</span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>DevOps</span>
              </span>
            </div>
          </div>

          {/* Subtitle / Summary Box */}
          <div className="p-4 rounded-xl bg-card border border-card-border text-sm text-text-muted italic leading-relaxed font-medium">
            {blog.summary}
          </div>

          {/* Body Content */}
          <div className="pt-6 font-sans">
            {isHtmlContent(blog.content) ? (
              <SafeHtmlRenderer html={blog.content} />
            ) : (
              renderMarkdown(blog.content)
            )}
          </div>
        </article>

        {/* Comments Section */}
        <section className="pt-4">
          <CommentsSection blogId={blog.id} />
        </section>
      </motion.main>

      <Footer />
    </>
  );
}
