import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/utils/db';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: 'Invalid Blog ID' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input('blogId', sql.Int, blogId)
      .query(
        `SELECT comment_id, blog_id, parent_comment_id, type, author_name, author_email, content, created_at, reply_count, status
         FROM comments
         WHERE blog_id = @blogId AND status = 'approved'
         ORDER BY created_at ASC`
      );

    const allComments = result.recordset;

    const rootComments = allComments.filter((c) => c.type === 'comment' || !c.parent_comment_id);
    const replies = allComments.filter((c) => c.type === 'reply' && c.parent_comment_id);

    const mappedComments = rootComments.map((root) => {
      const commentReplies = replies
        .filter((r) => r.parent_comment_id === root.comment_id)
        .map((r) => ({
          comment_id: r.comment_id,
          parent_comment_id: r.parent_comment_id,
          type: 'reply' as const,
          author_name: r.author_name,
          author_email: r.author_email,
          content: r.content,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));

      return {
        comment_id: root.comment_id,
        parent_comment_id: root.parent_comment_id || null,
        type: 'comment' as const,
        author_name: root.author_name,
        author_email: root.author_email,
        content: root.content,
        created_at: root.created_at ? new Date(root.created_at).toISOString() : new Date().toISOString(),
        reply_count: commentReplies.length,
        replies: commentReplies,
      };
    });

    return NextResponse.json({ items: mappedComments });
  } catch (error: any) {
    console.error('API Comments GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: 'Invalid Blog ID' }, { status: 400 });
    }

    const { email, author_name, content } = await request.json();
    if (!email || !author_name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commentId = 'cmt_' + crypto.randomBytes(16).toString('hex');
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
    const now = new Date();

    const pool = await getDbConnection();
    await pool
      .request()
      .input('commentId', sql.NVarChar, commentId)
      .input('blogId', sql.Int, blogId)
      .input('parentCommentId', sql.NVarChar, null)
      .input('type', sql.NVarChar, 'comment')
      .input('authorName', sql.NVarChar, author_name)
      .input('authorEmail', sql.NVarChar, email)
      .input('authorEmailHash', sql.NVarChar, emailHash)
      .input('content', sql.NVarChar, content)
      .input('createdAt', sql.DateTime, now)
      .input('replyCount', sql.Int, 0)
      .input('status', sql.NVarChar, 'approved')
      .query(
        `INSERT INTO comments (comment_id, blog_id, parent_comment_id, type, author_name, author_email, author_email_hash, content, created_at, reply_count, status)
         VALUES (@commentId, @blogId, @parentCommentId, @type, @authorName, @authorEmail, @authorEmailHash, @content, @createdAt, @replyCount, @status)`
      );

    const newComment = {
      comment_id: commentId,
      parent_comment_id: null,
      type: 'comment' as const,
      author_name,
      author_email: email,
      content,
      created_at: now.toISOString(),
      reply_count: 0,
      replies: [],
    };

    return NextResponse.json({ comment: newComment });
  } catch (error: any) {
    console.error('API Comments POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
