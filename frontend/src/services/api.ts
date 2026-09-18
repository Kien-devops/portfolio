// Vite injects VITE_API_URL if configured, otherwise we default to relative path (standard for CloudFront routing)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

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
};

