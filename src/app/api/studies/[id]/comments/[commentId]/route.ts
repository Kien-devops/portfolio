import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/utils/db';
import crypto from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const studyId = parseInt(id, 10);
    if (isNaN(studyId)) {
      return NextResponse.json({ error: 'Invalid Study ID' }, { status: 400 });
    }

    const { email, author_name, content } = await request.json();
    if (!email || !author_name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const replyId = 'rep_' + crypto.randomBytes(16).toString('hex');
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
    const now = new Date();

    const pool = await getDbConnection();
    
    // Verify that the parent comment exists and belongs to the same study post
    const checkParent = await pool
      .request()
      .input('commentId', sql.NVarChar, commentId)
      .input('studyId', sql.Int, studyId)
      .query('SELECT comment_id FROM study_comments WHERE comment_id = @commentId AND study_id = @studyId');

    if (checkParent.recordset.length === 0) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // Insert the reply
    await pool
      .request()
      .input('commentId', sql.NVarChar, replyId)
      .input('studyId', sql.Int, studyId)
      .input('parentCommentId', sql.NVarChar, commentId)
      .input('type', sql.NVarChar, 'reply')
      .input('authorName', sql.NVarChar, author_name)
      .input('authorEmail', sql.NVarChar, email)
      .input('authorEmailHash', sql.NVarChar, emailHash)
      .input('content', sql.NVarChar, content)
      .input('createdAt', sql.DateTime, now)
      .input('replyCount', sql.Int, 0)
      .input('status', sql.NVarChar, 'approved')
      .query(
        `INSERT INTO study_comments (comment_id, study_id, parent_comment_id, type, author_name, author_email, author_email_hash, content, created_at, reply_count, status)
         VALUES (@commentId, @studyId, @parentCommentId, @type, @authorName, @authorEmail, @authorEmailHash, @content, @createdAt, @replyCount, @status)`
      );

    // Update parent comment reply_count
    await pool
      .request()
      .input('parentCommentId', sql.NVarChar, commentId)
      .query('UPDATE study_comments SET reply_count = reply_count + 1 WHERE comment_id = @parentCommentId');

    const newReply = {
      comment_id: replyId,
      parent_comment_id: commentId,
      type: 'reply' as const,
      author_name,
      author_email: email,
      content,
      created_at: now.toISOString(),
    };

    return NextResponse.json({ reply: newReply });
  } catch (error: any) {
    console.error('API Study Reply POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
