'use client';

import { useState } from 'react';
import { createLesson, Lesson } from '@/utils/api';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyId: string;
  adminToken: string;
  onLessonAdded: (newLesson: Lesson) => void;
  nextOrderNum: number;
}

// ponytail: reused native <dialog> Modal to remove overlay, scale variants & close button dups
export default function AddLessonModal({ isOpen, onClose, studyId, adminToken, onLessonAdded, nextOrderNum }: AddLessonModalProps) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [orderNum, setOrderNum] = useState(nextOrderNum);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { title, video_url: videoUrl, duration, order_num: Number(orderNum) };
      const res = await createLesson(studyId, payload, adminToken);
      if (res) {
        onLessonAdded(res);
        setTitle('');
        setVideoUrl('');
        setDuration('');
        setOrderNum(nextOrderNum + 1);
        onClose();
      } else {
        setError('Failed to create lesson. Verify you are authorized.');
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
      title="Add Video Lesson"
      icon={<Play className="w-4 h-4 fill-accent text-accent" />}
      maxWidthClass="max-w-md"
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
            Lesson Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 1. Understanding Kubernetes Pods"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Video YouTube ID / URL
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
              Duration (e.g. 12:45)
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="10:00"
              className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
              Order Number
            </label>
            <input
              type="number"
              value={orderNum}
              onChange={(e) => setOrderNum(Number(e.target.value))}
              placeholder="1"
              min={1}
              className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-black font-bold text-xs transition-colors duration-250 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Adding Lesson...</span>
            </>
          ) : (
            <span>Publish Lesson</span>
          )}
        </button>
      </form>
    </Modal>
  );
}
