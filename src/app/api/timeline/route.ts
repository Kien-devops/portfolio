import { NextResponse } from 'next/server';
import { getDbConnection } from '@/utils/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      `SELECT id, type, role, company, duration, location, description, title, issuer, badge_url, icon, [order]
       FROM timeline
       ORDER BY [order] ASC`
    );
    
    const timelineItems = result.recordset.map(item => ({
      id: item.id,
      type: item.type,
      role: item.role || undefined,
      company: item.company || undefined,
      duration: item.duration || undefined,
      location: item.location || undefined,
      description: item.description || undefined,
      title: item.title || undefined,
      issuer: item.issuer || undefined,
      badge_url: item.badge_url || undefined,
      icon: item.icon || undefined,
      order: item.order,
    }));

    return NextResponse.json(timelineItems);
  } catch (error: any) {
    console.error('API Timeline GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
