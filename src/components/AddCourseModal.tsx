'use client';

import { useState } from 'react';
import { createCourse, Study } from '@/utils/api';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  onCourseAdded: (newCourse: Study) => void;
}

// ponytail: reused native <dialog> Modal to remove overlay, scale variants & close button dups
export default function AddCourseModal({ isOpen, onClose, adminToken, onCourseAdded }: AddCourseModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('fa-solid fa-graduation-cap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { title, summary, content, category, image_url: imageUrl };
      const res = await createCourse(payload, adminToken);
      if (res) {
        onCourseAdded(res);
        setTitle('');
        setSummary('');
        setContent('');
        setCategory('');
        setImageUrl('fa-solid fa-graduation-cap');
        onClose();
      } else {
        setError('Failed to create course. Verify you are authorized.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Video Course"
      icon={<BookOpen className="w-4 h-4" />}
      maxWidthClass="max-w-lg"
    >
      {error && (
        <div className="flex items-start gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Docker Basics"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Kubernetes, Docker, CI/CD"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            FontAwesome Icon Class / Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="fa-solid fa-graduation-cap"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Short Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A brief overview of the course scope..."
            rows={2}
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Extended Content/Markdown description
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detailed learning path, outcomes..."
            rows={4}
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-black font-bold text-xs transition-colors duration-250 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Course...</span>
            </>
          ) : (
            <span>Publish Course</span>
          )}
        </button>
      </form>
    </Modal>
  );
}
