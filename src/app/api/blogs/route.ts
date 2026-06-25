import { NextResponse } from 'next/server';
import { getDbConnection } from '@/utils/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      `SELECT id, title, summary, content, image_url, created_at
       FROM blogs
       ORDER BY created_at DESC`
    );

    const blogs = result.recordset.map((blog) => ({
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
    }));

    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('API Blogs GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
