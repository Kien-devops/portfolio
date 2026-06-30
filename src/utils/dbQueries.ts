import { unstable_cache } from 'next/cache';
import { getDbConnection } from '@/utils/db';
import { TimelineItem, Project, Blog } from './api';

// ponytail: dedicated server-only database query module
// This prevents browser compiler from pulling 'tedious' / 'mssql' and causing module dns/net/tls not found.

async function fetchTimelineFromDb(): Promise<TimelineItem[]> {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      `SELECT id, type, role, company, duration, location, description, title, issuer, badge_url, icon, [order]
       FROM timeline
       ORDER BY [order] ASC`
    );
    
    return result.recordset.map(item => ({
      id: String(item.id),
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
  } catch (err) {
    console.error('fetchTimelineDirect failed:', err);
    throw err;
  }
}

async function fetchProjectsFromDb(): Promise<Project[]> {
  try {
    const pool = await getDbConnection();
    const projectsResult = await pool.request().query(
      `SELECT id, project_number, title, summary, github_url, tech_stack
       FROM projects`
    );
    const detailsResult = await pool.request().query(
      `SELECT id, project_id, icon, detail_title, detail_description
       FROM project_details`
    );
    const details = detailsResult.recordset;

    return projectsResult.recordset.map((project, index) => {
      const projectDetails = details
        .filter((d) => d.project_id === project.id)
        .map((d) => ({
          icon: d.icon || undefined,
          detail_title: d.detail_title,
          detail_description: d.detail_description,
        }));

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
        project_number: project.project_number || `PROJECT ${String(index + 1).padStart(2, '0')}`,
        title: project.title,
        summary: project.summary,
        github_url: project.github_url,
        tech_stack: parsedTechStack,
        details: projectDetails,
      };
    });
  } catch (err) {
    console.error('fetchProjectsDirect failed:', err);
    throw err;
  }
}

async function fetchBlogsFromDb(): Promise<Blog[]> {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      `SELECT id, title, summary, content, image_url, created_at
       FROM blogs
       ORDER BY created_at DESC`
    );

    return result.recordset.map((blog) => ({
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
  } catch (err) {
    console.error('fetchBlogsDirect failed:', err);
    throw err;
  }
}

async function fetchBlogDetailFromDb(id: string): Promise<Blog | null> {
  try {
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', id)
      .query(
        `SELECT id, title, summary, content, image_url, created_at
         FROM blogs
         WHERE id = @id`
      );
    
    const blog = result.recordset[0];
    if (!blog) return null;

    return {
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
  } catch (err) {
    console.error(`fetchBlogDetailDirect failed for ${id}:`, err);
    return null;
  }
}

export const fetchTimelineDirect = unstable_cache(
  fetchTimelineFromDb,
  ['timeline-direct'],
  { revalidate: 300 }
);

export const fetchProjectsDirect = unstable_cache(
  fetchProjectsFromDb,
  ['projects-direct'],
  { revalidate: 300 }
);

export const fetchBlogsDirect = unstable_cache(
  fetchBlogsFromDb,
  ['blogs-direct'],
  { revalidate: 300 }
);

export const fetchBlogDetailDirect = unstable_cache(
  fetchBlogDetailFromDb,
  ['blog-detail-direct'],
  { revalidate: 300 }
);
