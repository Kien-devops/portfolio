import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/utils/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      `SELECT s.id, s.title, s.summary, s.content, s.image_url, s.category, s.created_at,
              (SELECT COUNT(*) FROM study_lessons WHERE study_id = s.id) as lessons_count
       FROM studies s
       ORDER BY s.created_at DESC`
    );

    const studies = result.recordset.map((study) => ({
      id: String(study.id),
      title: study.title,
      summary: study.summary,
      content: study.content,
      image_url: study.image_url,
      category: study.category || 'DevOps',
      lessons_count: study.lessons_count || 0,
      date: study.created_at ? new Date(study.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }) : '',
    }));

    return NextResponse.json(studies);
  } catch (error: any) {
    console.error('API Studies GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPass = process.env.ADMIN_PASSWORD || 'Kiennguly24@';
    if (!authHeader || authHeader !== adminPass) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, summary, content, image_url, category } = await request.json();
    if (!title || !summary || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('summary', sql.NVarChar, summary)
      .input('content', sql.NVarChar, content)
      .input('imageUrl', sql.NVarChar, image_url || 'fa-solid fa-book')
      .input('category', sql.NVarChar, category || 'DevOps')
      .query(
        `INSERT INTO studies (title, summary, content, image_url, category, created_at)
         OUTPUT INSERTED.id, INSERTED.created_at
         VALUES (@title, @summary, @content, @imageUrl, @category, GETDATE())`
      );

    const newCourse = {
      id: String(result.recordset[0].id),
      title,
      summary,
      content,
      image_url: image_url || 'fa-solid fa-book',
      category: category || 'DevOps',
      lessons_count: 0,
      date: new Date(result.recordset[0].created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })
    };

    return NextResponse.json(newCourse);
  } catch (error: any) {
    console.error('API Studies POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

