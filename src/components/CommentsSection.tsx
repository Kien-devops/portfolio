'use client';

import { useEffect, useState } from 'react';
import { Comment, fetchComments, postComment, postReply } from '@/utils/api';
import { MessageSquare, Reply, Send, Loader2, AlertCircle } from 'lucide-react';

interface CommentsSectionProps {
  blogId: string;
}

// Unified recursive interface for parent comments and replies
interface CommentNode {
  comment_id: string;
  parent_comment_id: string | null;
  type: 'comment' | 'reply';
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  reply_count?: number;
  replies?: CommentNode[];
}

export default function CommentsSection({ blogId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for parent comment
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  // Reply state: maps parent comment ID to its active reply form inputs
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Email validation regex
  const validateEmail = (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  // Recursive count utility
  const countComments = (nodes: CommentNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      count += 1;
      if (node.replies && node.replies.length > 0) {
        count += countComments(node.replies);
      }
    }
    return count;
  };

  // Recursive state update utility
  const addReplyToTree = (items: CommentNode[], parentId: string, newReply: CommentNode): CommentNode[] => {
    return items.map(item => {
      if (item.comment_id === parentId) {
        return {
          ...item,
          reply_count: (item.reply_count || 0) + 1,
          replies: [...(item.replies || []), newReply]
        };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: addReplyToTree(item.replies, parentId, newReply)
        };
      }
      return item;
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchComments(blogId);
        // Normalize comments tree structure from S3/DynamoDB response
        const formatNodes = (items: any[]): CommentNode[] => {
          return items.map(item => ({
            ...item,
            replies: item.replies ? formatNodes(item.replies) : []
          }));
        };
        setComments(formatNodes(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [blogId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authorName.trim() || !email.trim() || !content.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await postComment(blogId, {
        author_name: authorName,
        email: email,
        content: content
      });

      if (newComment) {
        const commentNode: CommentNode = {
          ...newComment,
          replies: []
        };
        setComments([commentNode, ...comments]);
        setContent('');
      } else {
        setError('Failed to submit comment. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    setError(null);

    if (!replyName.trim() || !replyEmail.trim() || !replyContent.trim()) {
      setError('Please fill in all reply fields.');
      return;
    }
    if (!validateEmail(replyEmail)) {
      setError('Please enter a valid email address for your reply.');
      return;
    }

    try {
      setReplySubmitting(true);
      const newReply = await postReply(blogId, parentId, {
        author_name: replyName,
        email: replyEmail,
        content: replyContent
      });

      if (newReply) {
        const replyNode: CommentNode = {
          ...newReply,
          replies: []
        };
        setComments(prevComments => addReplyToTree(prevComments, parentId, replyNode));
        setReplyContent('');
        setReplyingToId(null);
      } else {
        setError('Failed to submit reply. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred while replying.');
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Sanitizes and renders comment text safely, preserving formatting and HTML styling tags
  const renderCommentContent = (contentString: string) => {
    if (!contentString) return null;

    if (!/<[a-z][\s\S]*>/i.test(contentString)) {
      return <span className="whitespace-pre-wrap">{contentString}</span>;
    }

    let sanitized = contentString;
    // Strip script and style blocks
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Strip interactive attributes
    sanitized = sanitized.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '');
    sanitized = sanitized.replace(/\son\w+\s*=\s*\S+/gi, '');
    // Strip JavaScript URLs
    sanitized = sanitized.replace(/href\s*=\s*(['"])javascript:.*?\1/gi, '');
    // Strip embedding tags
    sanitized = sanitized.replace(/<(iframe|frameset|object|embed|applet|meta|link|base)[^>]*>[\s\S]*?<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(iframe|frameset|object|embed|applet|meta|link|base)[^>]*>/gi, '');

    return (
      <span
        className="comment-html-content whitespace-pre-wrap break-words inline-block w-full"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  };

  // Recursively renders a comment/reply node and all of its sub-replies
  const renderCommentNode = (node: CommentNode, depth: number = 0) => {
    const isParentComment = node.type === 'comment';
    // Visual indentation wrapper for replies
    const indentClass = depth > 0 ? 'pl-4 md:pl-6 border-l border-card-border/60 ml-3 md:ml-4' : '';

    return (
      <div key={node.comment_id} className={`space-y-4 ${indentClass}`}>
        {/* Comment Panel */}
        <div className={`border rounded-xl p-4 flex items-start gap-3.5 transition-all ${
          isParentComment 
            ? 'bg-card border-card-border' 
            : 'bg-card/60 border-card-border/80'
        }`}>
          {/* User Avatar */}
          <div className={`rounded-full flex items-center justify-center font-bold shrink-0 select-none ${
            isParentComment 
              ? 'w-10 h-10 bg-accent/10 border border-accent/20 text-sm text-accent' 
              : 'w-8 h-8 bg-foreground/5 border border-foreground/10 text-xs text-text-muted'
          }`}>
            {getInitials(node.author_name)}
          </div>

          {/* User Content */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h5 className={`font-bold text-foreground truncate ${isParentComment ? 'text-sm' : 'text-xs'}`}>
                {node.author_name}
              </h5>
              <span className="text-[10px] font-mono text-text-muted shrink-0">
                {formatRelativeTime(node.created_at)}
              </span>
            </div>

            {/* Comment Body */}
            <div className={`text-text-muted leading-relaxed ${isParentComment ? 'text-sm' : 'text-xs'}`}>
              {renderCommentContent(node.content)}
            </div>

            {/* Reply Button */}
            <button
              onClick={() => {
                setReplyingToId(replyingToId === node.comment_id ? null : node.comment_id);
                setReplyName(authorName);
                setReplyEmail(email);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors mt-2"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {/* Inline Reply Form */}
        {replyingToId === node.comment_id && (
          <form
            onSubmit={(e) => handleReplySubmit(e, node.comment_id)}
            className="pl-4 md:pl-6 ml-3 md:ml-4 space-y-3 bg-card/40 border border-card-border/60 rounded-xl p-4"
          >
            <h6 className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
              Reply to {node.author_name}
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-3.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Your email (private)"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-3.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <textarea
              rows={2}
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-background border border-card-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
              required
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1.5 rounded-lg border border-card-border text-text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={replySubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {replySubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Reply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Recursive Children rendering */}
        {node.replies && node.replies.length > 0 && (
          <div className="space-y-4">
            {node.replies.map((child) => renderCommentNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 border-b border-card-border pb-4">
        <MessageSquare className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Discussion ({countComments(comments)})
        </h3>
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handleCommentSubmit} className="space-y-4 bg-card border border-card-border rounded-xl p-5 md:p-6">
        <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Leave a comment</h4>
        {error && (
          <div className="flex items-start gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="comment-name" className="block text-xs font-mono font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              id="comment-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-background border border-card-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="block text-xs font-mono font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Email (not published)
            </label>
            <input
              type="email"
              id="comment-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@domain.com"
              className="w-full bg-background border border-card-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-text" className="block text-xs font-mono font-medium text-text-muted uppercase tracking-wider mb-1.5">
            Comment
          </label>
          <textarea
            id="comment-text"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Comment</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="text-sm font-mono">Loading discussions...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-card/40 border border-card-border/50 rounded-xl">
          <MessageSquare className="w-8 h-8 mx-auto text-text-muted mb-3 opacity-40" />
          <p className="text-sm text-text-muted">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        /* Comments List */
        <div className="space-y-6">
          {comments.map((comment) => renderCommentNode(comment, 0))}
        </div>
      )}
    </div>
  );
}
