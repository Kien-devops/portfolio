import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Loader2 } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { api } from "../services/api.js";
import { BlogContent } from "../types/index.js";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getBlogDetail(slug);
        setBlog(data);
      } catch (err: any) {
        console.error("Error fetching blog detail:", err);
        setError("The blog post you are looking for could not be found or has been unpublished.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium">Fetching article from S3...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="liquid-card p-4 text-red-400">
          <p className="font-semibold text-lg">{error || "Article not found"}</p>
        </div>
        <Link
          to="/"
          className="liquid-button-secondary inline-flex items-center space-x-2 px-6 py-2.5 text-slate-300 font-semibold hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Parse Markdown to HTML
  // Marked configuration for safe rendering
  const rawHtml = marked.parse(blog.content, {
    gfm: true,
    breaks: true,
  }) as string;
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 relative">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-400 font-semibold transition-colors mb-8"
        id="blog-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <article className="space-y-8">
        {/* Cover Image */}
        <div className="liquid-card h-64 sm:h-96 w-full overflow-hidden shadow-2xl relative">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80"></div>
        </div>

        {/* Blog Header Metadata */}
        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="liquid-chip px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display leading-tight text-slate-100">
            {blog.title}
          </h1>

          <div className="flex items-center space-x-6 text-slate-400 text-xs sm:text-sm pt-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              <span>
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
              <span>Technical Article</span>
            </div>
          </div>

          <p className="text-slate-300 italic border-l-4 border-indigo-500 pl-4 text-base mt-6">
            {blog.summary}
          </p>
        </div>

        {/* Blog HTML Content */}
        <div
          className="prose prose-invert prose-indigo max-w-none pt-8 border-t border-slate-900 leading-relaxed text-slate-300
            prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-100
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:mb-6 prose-p:text-slate-300
            prose-code:text-indigo-300 prose-code:bg-slate-900/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-800 prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:p-4 prose-pre:rounded-2xl
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
            prose-li:mb-2
            prose-a:text-indigo-400 prose-a:underline hover:prose-a:text-indigo-300
            prose-blockquote:border-l-4 prose-blockquote:border-slate-800 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </article>
    </div>
  );
}
