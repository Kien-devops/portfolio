'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

function BlogDetailPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  return <BlogDetailClient id={id} />;
}

export default function BlogDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 text-center text-text-muted">
        Loading article details...
      </div>
    }>
      <BlogDetailPageContent />
    </Suspense>
  );
}
