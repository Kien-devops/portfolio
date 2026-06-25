import { NextResponse } from 'next/server';
import { getDbConnection } from '@/utils/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    
    // Fetch all projects
    const projectsResult = await pool.request().query(
      `SELECT id, project_number, title, summary, github_url, tech_stack, demo_url, image_url, description, slug, status
       FROM projects`
    );

    // Fetch all project details
    const detailsResult = await pool.request().query(
      `SELECT id, project_id, icon, detail_title, detail_description
       FROM project_details`
    );

    const details = detailsResult.recordset;

    const projects = projectsResult.recordset.map((project) => {
      // Find matching details for this project
      const projectDetails = details
        .filter((d) => d.project_id === project.id)
        .map((d) => ({
          icon: d.icon || undefined,
          detail_title: d.detail_title,
          detail_description: d.detail_description,
        }));

      // Parse tech_stack from DB
      let parsedTechStack: string[] = [];
      if (project.tech_stack) {
        try {
          const parsed = JSON.parse(project.tech_stack);
          parsedTechStack = Array.isArray(parsed) ? parsed : [project.tech_stack];
        } catch {
          parsedTechStack = project.tech_stack
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
        }
      }

      return {
        id: String(project.id),
        project_number: project.project_number,
        title: project.title,
        summary: project.summary,
        github_url: project.github_url,
        tech_stack: parsedTechStack,
        details: projectDetails,
      };
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('API Projects GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
