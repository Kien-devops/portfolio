import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/utils/db';

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
        `SELECT id, title, summary, content, image_url, created_at
         FROM blogs
         WHERE id = @blogId`
      );

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const blog = result.recordset[0];
    const mappedBlog = {
      id: String(blog.id),
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      image_url: blog.image_url,
      date: blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }) : '',
    };

    return NextResponse.json(mappedBlog);
  } catch (error: any) {
    console.error('API Blog Detail GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
