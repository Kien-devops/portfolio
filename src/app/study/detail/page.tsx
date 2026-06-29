'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudyDetailClient from './StudyDetailClient';

function StudyDetailPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  return <StudyDetailClient id={id} />;
}

export default function StudyDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-32 pb-20 text-center text-text-muted">
        Loading study details...
      </div>
    }>
      <StudyDetailPageContent />
    </Suspense>
  );
}
