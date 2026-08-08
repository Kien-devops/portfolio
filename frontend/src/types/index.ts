export interface Profile {
  name: string;
  headline: string;
  bio: string;
  email: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl: string;
}

export interface Project {
  projectId: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
  displayOrder: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  skillId: string;
  name: string;
  category: string;
  level: number;
  displayOrder: number;
}

export interface Experience {
  experienceId: string;
  company: string;
  position: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // YYYY-MM or null
  description: string;
  displayOrder: number;
}

export interface Education {
  educationId: string;
  school: string;
  major: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  description: string;
}

export interface Contact {
  contactId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: string;
}

export interface BlogMetadata {
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  updatedAt: string;
}

export interface BlogContent extends BlogMetadata {
  content: string;
}

export interface HandsonMetadata {
  slug: string;
  title: string;
  summary: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  updatedAt: string;
  prerequisites?: string[];
}

export interface HandsonDetail extends HandsonMetadata {
  content: string;
}

