import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/utils/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studyId = parseInt(id, 10);
    if (isNaN(studyId)) {
      return NextResponse.json({ error: 'Invalid Study ID' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input('studyId', sql.Int, studyId)
      .query(
        `SELECT id, study_id, title, video_url, duration, order_num
         FROM study_lessons
         WHERE study_id = @studyId
         ORDER BY order_num ASC`
      );

    const lessons = result.recordset.map((lesson) => ({
      id: String(lesson.id),
      study_id: String(lesson.study_id),
      title: lesson.title,
      video_url: lesson.video_url,
      duration: lesson.duration || '',
      order_num: lesson.order_num,
    }));

    return NextResponse.json(lessons);
  } catch (error: any) {
    console.error('API Study Lessons GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPass = process.env.ADMIN_PASSWORD || 'Kiennguly24@';
    if (!authHeader || authHeader !== adminPass) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const studyId = parseInt(id, 10);
    if (isNaN(studyId)) {
      return NextResponse.json({ error: 'Invalid Study ID' }, { status: 400 });
    }

    const { title, video_url, duration, order_num } = await request.json();
    if (!title || !video_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input('studyId', sql.Int, studyId)
      .input('title', sql.NVarChar, title)
      .input('videoUrl', sql.NVarChar, video_url)
      .input('duration', sql.NVarChar, duration || '')
      .input('orderNum', sql.Int, order_num || 1)
      .query(
        `INSERT INTO study_lessons (study_id, title, video_url, duration, order_num)
         OUTPUT INSERTED.id
         VALUES (@studyId, @title, @videoUrl, @duration, @orderNum)`
      );

    const newLesson = {
      id: String(result.recordset[0].id),
      study_id: String(studyId),
      title,
      video_url,
      duration: duration || '',
      order_num: order_num || 1
    };

    return NextResponse.json(newLesson);
  } catch (error: any) {
    console.error('API Study Lessons POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

