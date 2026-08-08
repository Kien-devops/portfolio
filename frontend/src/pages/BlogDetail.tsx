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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-mono bg-[#ffffff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        <p className="text-[#666666] text-sm">fetching article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4 font-mono bg-[#ffffff]">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded">
          <p>{error || "Article not found"}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-[#666666] hover:text-[#2563eb] transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Home</span>
        </Link>
      </div>
    );
  }

  const rawHtml = marked.parse(blog.content, {
    gfm: true,
    breaks: true,
  }) as string;
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <div className="bg-[#ffffff] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-[#111111]">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 font-mono text-xs text-[#666666] hover:text-[#2563eb] transition-colors mb-8"
          id="blog-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Home</span>
        </Link>

        <article className="space-y-8 bg-[#ffffff] p-8 border border-[#e5e5e5] rounded-lg shadow-sm">
          {/* Cover Image if available */}
          {blog.coverImage && (
            <div className="border border-[#e5e5e5] rounded overflow-hidden max-h-80">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Blog Header Metadata */}
          <div className="space-y-3 border-b border-[#e5e5e5] pb-6">
            <div className="flex flex-wrap gap-2 font-mono text-xs text-[#2563eb] font-semibold">
              {blog.tags.map((tag) => (
                <span key={tag}>[{tag}]</span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-4 font-mono text-xs text-[#666666]">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Technical Note</span>
              </div>
            </div>

            {blog.summary && (
              <p className="text-sm text-[#666666] italic border-l-2 border-[#2563eb] pl-3 pt-1 font-sans">
                {blog.summary}
              </p>
            )}
          </div>

          {/* Blog HTML Content */}
          <div
            className="prose max-w-none leading-relaxed text-[#111111] font-sans
              prose-headings:font-bold prose-headings:text-[#111111]
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-sm prose-p:text-[#666666] prose-p:leading-relaxed
              prose-code:text-[#2563eb] prose-code:font-mono prose-code:bg-[#f5f5f5] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#e5e5e5] prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#111111] prose-pre:text-[#f5f5f5] prose-pre:p-4 prose-pre:rounded-md
              prose-ul:list-disc prose-ul:pl-6 prose-ul:text-sm prose-ul:text-[#666666]
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-sm prose-ol:text-[#666666]
              prose-li:mb-1
              prose-a:text-[#2563eb] prose-a:underline hover:prose-a:text-[#111111]"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </article>
      </div>
    </div>
  );
}
