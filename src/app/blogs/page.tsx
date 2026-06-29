import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import BlogCard from '@/components/BlogCard';
import { fetchBlogsDirect } from '@/utils/dbQueries';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

// ponytail: Redesigned /blogs list page to fetch data directly from SQL database on server-side.
// Removed unnecessary state management and loader delay overlays.
export default async function BlogsPage() {
  const blogs = await fetchBlogsDirect().catch(() => []);

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-12 animate-fade-up">
        {/* Header Block */}
        <section className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/8 border border-accent/20 text-accent text-[11px] font-mono tracking-widest uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>DevOps Articles</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
            Engineering Insights
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed font-medium">
            Read detailed breakdowns of secure continuous integrations, network designs, and container orchestration strategies.
          </p>
        </section>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto text-text-muted opacity-40 mb-3" />
            <p className="text-text-muted font-medium">No articles found in the database.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
