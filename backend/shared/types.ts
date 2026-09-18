export interface Profile {
  PK: "PROFILE";
  SK: "PROFILE";
  name: string;
  headline: string;
  bio: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  avatarUrl: string;
}

export interface Project {
  PK: "PROJECT";
  SK: string; // PROJECT#project-id
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
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  PK: "SKILL";
  SK: string; // SKILL#skill-id
  skillId: string;
  name: string;
  category: string;
  level: number; // 0-100
  displayOrder: number;
}

export interface Experience {
  PK: "EXPERIENCE";
  SK: string; // EXPERIENCE#startDate#experienceId
  experienceId: string;
  company: string;
  position: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // YYYY-MM or null
  description: string;
  displayOrder: number;
}

export interface Education {
  PK: "EDUCATION";
  SK: string; // EDUCATION#education-id
  educationId: string;
  school: string;
  major: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  description: string;
}

export interface Contact {
  PK: "CONTACT";
  SK: string; // CONTACT#createdAt#contactId
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
  content: string; // Markdown text
}
