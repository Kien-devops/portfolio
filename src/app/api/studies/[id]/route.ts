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
        `SELECT id, title, summary, content, image_url, category, created_at
         FROM studies
         WHERE id = @studyId`
      );

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    const study = result.recordset[0];
    const mappedStudy = {
      id: String(study.id),
      title: study.title,
      summary: study.summary,
      content: study.content,
      image_url: study.image_url,
      category: study.category || 'DevOps',
      date: study.created_at ? new Date(study.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }) : '',
    };

    return NextResponse.json(mappedStudy);
  } catch (error: any) {
    console.error('API Study Detail GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
