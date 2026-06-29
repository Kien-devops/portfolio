'use client';

import { useState } from 'react';
import { loginAdmin } from '@/utils/api';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

// ponytail: reused native <dialog> Modal to remove overlay, scale variants & close button dups
export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin({ username, password });
      if (res.success && res.token) {
        onLoginSuccess(res.token);
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Portal"
      icon={<Lock className="w-4 h-4" />}
      maxWidthClass="max-w-sm"
    >
      <div className="flex flex-col items-center text-center space-y-1 mb-4">
        <p className="text-xs text-text-muted">Enter credentials to unlock administrative controls.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
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
              <span>Verifying...</span>
            </>
          ) : (
            <span>Authenticate</span>
          )}
        </button>
      </form>
    </Modal>
  );
}
