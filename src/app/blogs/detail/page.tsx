import { Suspense } from 'react';
import BlogDetailClient from './BlogDetailClient';
import { fetchBlogDetailDirect } from '@/utils/dbQueries';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

// ponytail: Replaced client-side search parameter parsing and fetching.
// Instead we pull searchParams and fetch directly from database at page load time.
export default async function BlogDetailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id || '';
  const blog = await fetchBlogDetailDirect(id);

  if (!blog) {
    return (
      <>
        <Navbar />
        <BackgroundGlows />
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 text-center text-text-muted">
          Article not found.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 text-center text-text-muted">
        Loading article details...
      </div>
    }>
      <BlogDetailClient blog={blog} />
    </Suspense>
  );
}
