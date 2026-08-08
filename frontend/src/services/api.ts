import { getToken } from "./auth.js";

// Vite injects VITE_API_URL if configured, otherwise we default to relative path (standard for CloudFront routing)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  // Automatically attach Cognito token for admin calls
  if (path.includes("/api/admin/")) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = result?.error?.message || result?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  // Consistent response format from backend: { success: true, data: T, message?: string }
  return result.data as T;
}

export const api = {
  // Public Portfolio Data
  getProfile: () => request<any>("/api/profile"),
  getProjects: () => request<any[]>("/api/projects"),
  getProject: (id: string) => request<any>(`/api/projects/${id}`),
  getSkills: () => request<any[]>("/api/skills"),
  getExperiences: () => request<any[]>("/api/experiences"),
  getEducation: () => request<any[]>("/api/education"),
  
  // Public Contact submission
  submitContact: (contactData: { name: string; email: string; subject: string; message: string; website?: string }) =>
    request<any>("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    }),

  // Admin Profile
  updateProfile: (profile: any) =>
    request<any>("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }),

  // Admin Projects
  createProject: (project: any) =>
    request<any>("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    }),
  updateProject: (id: string, project: any) =>
    request<any>(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    }),
  deleteProject: (id: string) =>
    request<any>(`/api/admin/projects/${id}`, {
      method: "DELETE",
    }),

  // Admin Skills
  createSkill: (skill: any) =>
    request<any>("/api/admin/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skill),
    }),
  updateSkill: (id: string, skill: any) =>
    request<any>(`/api/admin/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skill),
    }),
  deleteSkill: (id: string) =>
    request<any>(`/api/admin/skills/${id}`, {
      method: "DELETE",
    }),

  // Admin Experiences
  createExperience: (exp: any) =>
    request<any>("/api/admin/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exp),
    }),
  updateExperience: (id: string, exp: any) =>
    request<any>(`/api/admin/experiences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exp),
    }),
  deleteExperience: (id: string) =>
    request<any>(`/api/admin/experiences/${id}`, {
      method: "DELETE",
    }),

  // Admin Education
  createEducation: (edu: any) =>
    request<any>("/api/admin/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edu),
    }),
  updateEducation: (id: string, edu: any) =>
    request<any>(`/api/admin/education/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edu),
    }),
  deleteEducation: (id: string) =>
    request<any>(`/api/admin/education/${id}`, {
      method: "DELETE",
    }),

  // Admin Contacts
  getContacts: () => request<any[]>("/api/admin/contacts"),
  updateContactStatus: (id: string, status: string) =>
    request<any>(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  deleteContact: (id: string) =>
    request<any>(`/api/admin/contacts/${id}`, {
      method: "DELETE",
    }),

  // Admin Blogs
  createBlog: (blog: any) =>
    request<any>("/api/admin/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    }),
  updateBlog: (slug: string, blog: any) =>
    request<any>(`/api/admin/blogs/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    }),
  deleteBlog: (slug: string) =>
    request<any>(`/api/admin/blogs/${slug}`, {
      method: "DELETE",
    }),

  // Blog Loading (DynamoDB for Metadata + S3 for Markdown Content)
  getBlogList: async (): Promise<any[]> => {
    // 1. Try fetching from DynamoDB via API Gateway
    try {
      const apiUrl = `${API_BASE_URL}/api/blogs`;
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Could not load blog list from API Gateway DynamoDB endpoint, falling back to S3 index:", e);
    }

    // 2. Fallback to S3 index.json
    const url = `${API_BASE_URL}/content/blogs/index.json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load blog index: ${response.statusText}`);
    }
    return response.json();
  },
  
  getBlogDetail: async (slug: string): Promise<any> => {
    // 1. Fetch metadata from API Gateway or list
    let metadata: any = null;
    try {
      const apiUrl = `${API_BASE_URL}/api/blogs/${slug}`;
      const apiRes = await fetch(apiUrl, { cache: "no-store" });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.data) metadata = json.data;
      }
    } catch (e) {
      console.warn("Could not load blog metadata from API Gateway:", e);
    }

    if (!metadata) {
      try {
        const list = await api.getBlogList();
        metadata = list.find((item: any) => item.slug === slug);
      } catch (e) {
        console.warn("Could not load blog metadata from list:", e);
      }
    }

    // 2. Fetch raw markdown file from S3 (.md)
    try {
      const mdUrl = `${API_BASE_URL}/content/blogs/${slug}.md`;
      const mdRes = await fetch(mdUrl, { cache: "no-store" });
      if (mdRes.ok) {
        const content = await mdRes.text();
        return {
          ...(metadata || { slug, title: slug, tags: [], publishedAt: new Date().toISOString() }),
          content,
        };
      }
    } catch (e) {
      console.warn("Could not load blog markdown file, falling back to json:", e);
    }

    // 3. Fallback to json file
    const url = `${API_BASE_URL}/content/blogs/${slug}.json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load blog post: ${response.statusText}`);
    }
    return response.json();
  },

  // Hands-on Guide Loading (DynamoDB for Metadata + S3 for Markdown Content)
  getHandsonList: async (): Promise<any[]> => {
    // 1. Try fetching from DynamoDB via API Gateway
    try {
      const apiUrl = `${API_BASE_URL}/api/handson`;
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Could not load handson list from API Gateway DynamoDB endpoint, falling back to static S3 index:", e);
    }

    // 2. Fallback to S3 index.json
    const url = `${API_BASE_URL}/content/handson/index.json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load hands-on index: ${response.statusText}`);
    }
    return response.json();
  },

  getHandsonDetail: async (slug: string): Promise<{ metadata?: any; content: string }> => {
    // 1. Fetch metadata from DynamoDB or API list
    let metadata = null;
    try {
      const list = await api.getHandsonList();
      metadata = list.find((item: any) => item.slug === slug);
    } catch (e) {
      console.warn("Could not load handson metadata:", e);
    }

    // 2. Fetch the raw markdown content file directly from S3
    const mdUrl = `${API_BASE_URL}/content/handson/${slug}.md`;
    const response = await fetch(mdUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load hands-on markdown guide: ${response.statusText}`);
    }
    const content = await response.text();

    return { metadata, content };
  },
};

