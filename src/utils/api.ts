export interface TimelineItem {
  id: string;
  type: 'experience' | 'certification';
  role?: string;
  company?: string;
  duration?: string;
  location?: string;
  description?: string;
  title?: string;
  issuer?: string;
  badge_url?: string;
  icon?: string;
  order: number;
}

export interface Project {
  id: string;
  project_number: string;
  title: string;
  summary: string;
  github_url: string;
  tech_stack: string[];
  details: {
    icon?: string;
    detail_title: string;
    detail_description: string;
  }[];
}

export interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  date: string;
}

export interface CommentReply {
  comment_id: string;
  parent_comment_id: string;
  type: 'reply';
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface Comment {
  comment_id: string;
  parent_comment_id: string | null;
  type: 'comment';
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  reply_count: number;
  replies: CommentReply[];
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).PORTFOLIO_API_BASE_URL) {
    return (window as any).PORTFOLIO_API_BASE_URL.replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE_URL || '/api').replace(/\/$/, '');
}

// Default rich mock data to display when the API is not deployed
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    project_number: 'PROJECT 01',
    title: 'Automated DevSecOps Kubernetes Pipeline',
    summary: 'A production-ready, secure, and auto-scaling EKS cluster deployment pipeline integrated with DevSecOps tools for static, container, and dynamic scanning.',
    github_url: 'https://github.com/Kien-devops/eks-devsecops-pipeline',
    tech_stack: ['AWS', 'EKS', 'Terraform', 'Helm', 'GitLab CI', 'SonarQube', 'Trivy', 'Prometheus', 'ArgoCD'],
    details: [
      {
        icon: 'fa-solid fa-cloud-arrow-up',
        detail_title: 'Infrastructure as Code',
        detail_description: 'Provisioned multi-region VPCs, VPC Peering, and EKS clusters dynamically with modular Terraform scripts.'
      },
      {
        icon: 'fa-solid fa-shield-halved',
        detail_title: 'Shift-Left Security Integration',
        detail_description: 'Embedded automated vulnerability scanning in GitLab CI: SonarQube for source code quality gating, and Trivy for container image scanning.'
      },
      {
        icon: 'fa-solid fa-rotate',
        detail_title: 'Continuous Delivery via GitOps',
        detail_description: 'Configured ArgoCD with auto-sync and automated drift correction, implementing a zero-manual-access delivery mechanism.'
      }
    ]
  },
  {
    id: 'proj-2',
    project_number: 'PROJECT 02',
    title: 'Multi-Region VPC Peering Infrastructure',
    summary: 'A highly available network topography connecting AWS environments securely across regions without exposing internal workloads to the public internet.',
    github_url: 'https://github.com/Kien-devops/aws-vpc-peering-iac',
    tech_stack: ['AWS VPC', 'IAM', 'Security Groups', 'Terraform', 'Route53', 'Ansible'],
    details: [
      {
        icon: 'fa-solid fa-network-wired',
        detail_title: 'Secure Peering Topography',
        detail_description: 'Established VPC Peering tunnels between development and production environments, routing internal traffic entirely within AWS backbone.'
      },
      {
        icon: 'fa-solid fa-route',
        detail_title: 'Route Table & Subnet Isolation',
        detail_description: 'Engineered strict route table records and Network Access Control Lists (NACLs) to achieve cross-account micro-segmentation.'
      }
    ]
  }
];

const MOCK_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Securing Kubernetes Pipelines: A Practical Guide to Trivy & SonarQube',
    summary: 'How to shift security left by integrating automated container vulnerability scanning and static code analysis directly into your CI/CD pipelines.',
    content: '### Introduction\nIn modern DevOps practices, shifting security left is no longer optional. Waiting to scan your application until it is running in staging or production leads to expensive remediations and critical vulnerabilities. This guide will walk you through setting up Trivy container image scanning and SonarQube static analysis in a unified pipeline.\n\n### Step 1: Static Analysis with SonarQube\nSonarQube inspects source code for bugs, security hotspots, and code smells. You can trigger it easily within your build stages using a standard scanner. Here is a configuration snippet for GitLab CI:\n\n```yaml\nsonarqube-check:\n  stage: test\n  image: sonarsource/sonar-scanner-cli:latest\n  script:\n    - sonar-scanner -Dsonar.projectKey=my-project\n```\n\n### Step 2: Container Image Scanning with Trivy\nTrivy is a simple yet powerful vulnerability scanner. Running it right after the docker image is built lets you fail the build if high or critical vulnerabilities are detected.\n\n- Scan for package vulnerabilities\n- Filter results by severity (e.g., CRITICAL, HIGH)\n- Fail the pipeline block dynamically if gates are breached\n\n### Conclusion\nBy combining these two steps, you ensure that every container pushed to your container registry is pre-vetted for both software dependencies and source code vulnerabilities.',
    image_url: 'fa-solid fa-shield-halved',
    date: 'Jun 10, 2026'
  },
  {
    id: 'blog-2',
    title: 'Demystifying AWS VPC Peering and Route Tables',
    summary: 'Learn how to connect VPCs across different AWS regions and accounts securely without exposing traffic to the public internet.',
    content: '### Overview\nAs your cloud architecture scales, you often need to share data between separate virtual networks. Instead of routeing traffic over the public internet, VPC Peering establishes a direct route path between two virtual private clouds.\n\n### Core Configuration Checklist\n- **Initiating Peering:** One VPC sends a peering request to another, which must be explicitly accepted.\n- **Updating Route Tables:** Update route tables in both VPCs to target the peering connection ID (`pcx-xxxxxx`) for the destination subnet IP ranges.\n- **Configuring Security Groups:** Allow inbound rules from the peer VPC CIDR block to specific private ports.\n\n### Verifying the Connection\nYou can verify the network connection using direct ICMP ping tests or curl commands from inside the private subnets. Utilizing AWS Reachability Analyzer is also recommended to identify blockages.',
    image_url: 'fa-solid fa-route',
    date: 'May 24, 2026'
  }
];

const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: 'exp-1',
    type: 'experience',
    role: 'Lead Platform & DevOps Engineer',
    company: 'SecOps Cloud Solutions',
    duration: '2024 - Present',
    location: 'Hanoi, Vietnam (Hybrid)',
    description: 'Lead engineering for containerized deployments on AWS. Configured multi-region VPC peering routing, designed automated DevSecOps pipelines with SonarQube/Trivy gating, and standardized Helm chart templates.',
    order: 1
  },
  {
    id: 'exp-2',
    type: 'experience',
    role: 'Cloud Security & DevOps Engineer',
    company: 'Aegis Systems Corp',
    duration: '2022 - 2024',
    location: 'Singapore (Remote)',
    description: 'Architected EKS infrastructure blueprints with Terraform. Implemented declarative GitOps continuous delivery via Argo CD and optimized application telemetry collections with Prometheus and Grafana.',
    order: 2
  },
  {
    id: 'exp-3',
    type: 'experience',
    role: 'Systems Administrator & Automation Engineer',
    company: 'TechBase Global',
    duration: '2020 - 2022',
    location: 'Hanoi, Vietnam',
    description: 'Managed virtualization clusters, automated configurations with Ansible playbooks, built CI pipelines in GitLab CI, and monitored network routing paths.',
    order: 3
  },
  {
    id: 'cert-1',
    type: 'certification',
    title: 'AWS Certified Solutions Architect',
    issuer: 'Associate • Verified Credly Badge',
    badge_url: 'https://www.credly.com/badges/fb64362a-24b4-4006-bc6d-d7fd1428a9e1/public_url',
    icon: 'fa-brands fa-aws text-orange-400',
    order: 4
  },
  {
    id: 'cert-2',
    type: 'certification',
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Foundational • Verified Credly Badge',
    badge_url: 'https://www.credly.com/badges/d38c4a62-2af2-4593-9e90-5b0bd42517e2/public_url',
    icon: 'fa-brands fa-aws text-orange-400',
    order: 5
  }
];

export async function fetchTimeline(): Promise<TimelineItem[]> {
  const url = getApiBaseUrl();
  if (!url) return MOCK_TIMELINE;

  try {
    const res = await fetch(`${url}/timeline`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    if (!items.length) return MOCK_TIMELINE;
    return items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Failed to fetch timeline:', err);
    return MOCK_TIMELINE;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const url = getApiBaseUrl();
  if (!url) return MOCK_PROJECTS;

  try {
    const res = await fetch(`${url}/projects`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    if (!items.length) return MOCK_PROJECTS;
    return items.map((project: any, index: number) => {
      const techStack = project.tech_stack || project.techStack || [];
      return {
        id: project.id || `proj-${index}`,
        project_number: project.project_number || project.projectNumber || `PROJECT ${String(index + 1).padStart(2, '0')}`,
        title: project.title || project.name || 'Untitled Project',
        summary: project.summary || project.description || '',
        github_url: project.github_url || project.githubUrl || '',
        tech_stack: Array.isArray(techStack) ? techStack : String(techStack || '').split(',').map(t => t.trim()).filter(Boolean),
        details: Array.isArray(project.details) ? project.details : []
      };
    });
  } catch (err) {
    console.error('Failed to fetch projects, using mock data:', err);
    return MOCK_PROJECTS;
  }
}

export async function fetchBlogs(): Promise<Blog[]> {
  const url = getApiBaseUrl();
  if (!url) return MOCK_BLOGS;

  try {
    const res = await fetch(`${url}/blogs`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    if (!items.length) return MOCK_BLOGS;
    return items.map((blog: any, index: number) => ({
      id: blog.id || `blog-${index}`,
      title: blog.title || 'Untitled Blog',
      summary: blog.summary || '',
      content: blog.content || '',
      image_url: blog.image_url || blog.coverImage || blog.imageUrl || 'fa-solid fa-book',
      date: blog.date || new Date(blog.createdAt || blog.updatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }));
  } catch (err) {
    console.error('Failed to fetch blogs, using mock data:', err);
    return MOCK_BLOGS;
  }
}

export async function fetchBlogDetail(id: string): Promise<Blog | null> {
  const url = getApiBaseUrl();
  if (!url) {
    return MOCK_BLOGS.find(b => b.id === id) || null;
  }

  try {
    const res = await fetch(`${url}/blogs/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // The Lambda returns a structure with either `blog` object or item directly
    const blog = data.blog || data;
    if (!blog || !blog.id) {
      // Fallback inside mock if id is not found
      return MOCK_BLOGS.find(b => b.id === id) || null;
    }

    return {
      id: blog.id,
      title: blog.title || 'Untitled Blog',
      summary: blog.summary || '',
      content: blog.content || '',
      image_url: blog.image_url || blog.coverImage || blog.imageUrl || 'fa-solid fa-book',
      date: blog.date || new Date(blog.createdAt || blog.updatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    };
  } catch (err) {
    console.error(`Failed to fetch blog ${id}, using mock fallback:`, err);
    return MOCK_BLOGS.find(b => b.id === id) || null;
  }
}

export async function fetchComments(blogId: string): Promise<Comment[]> {
  const url = getApiBaseUrl();
  if (!url) return [];

  try {
    const res = await fetch(`${url}/blogs/${encodeURIComponent(blogId)}/comments`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.error(`Failed to fetch comments for blog ${blogId}:`, err);
    return [];
  }
}

export async function postComment(blogId: string, payload: { email: string; author_name: string; content: string }): Promise<Comment | null> {
  const url = getApiBaseUrl();
  if (!url) {
    // Return a local mock comment if url is empty
    return {
      comment_id: `cmt_local_${Math.random().toString(36).substring(2)}`,
      parent_comment_id: null,
      type: 'comment',
      author_name: payload.author_name || 'Anonymous',
      author_email: payload.email,
      content: payload.content,
      created_at: new Date().toISOString(),
      reply_count: 0,
      replies: []
    };
  }

  try {
    const res = await fetch(`${url}/blogs/${encodeURIComponent(blogId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.comment || null;
  } catch (err) {
    console.error('Failed to post comment:', err);
    return null;
  }
}

export async function postReply(blogId: string, parentCommentId: string, payload: { email: string; author_name: string; content: string }): Promise<CommentReply | null> {
  const url = getApiBaseUrl();
  if (!url) {
    // Return a local mock reply if url is empty
    return {
      comment_id: `rep_local_${Math.random().toString(36).substring(2)}`,
      parent_comment_id: parentCommentId,
      type: 'reply',
      author_name: payload.author_name || 'Anonymous',
      author_email: payload.email,
      content: payload.content,
      created_at: new Date().toISOString()
    };
  }

  try {
    const res = await fetch(`${url}/blogs/${encodeURIComponent(blogId)}/comments/${encodeURIComponent(parentCommentId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply || null;
  } catch (err) {
    console.error('Failed to post reply:', err);
    return null;
  }
}
