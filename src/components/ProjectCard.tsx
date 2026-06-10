'use client';

import { Project } from '@/utils/api';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      className="group relative flex flex-col gap-6 rounded-2xl border border-card-border bg-card p-6 md:p-8 backdrop-blur-md shadow-lg hover:border-accent/40 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.15)] transition-all duration-500"
    >
      {/* Dynamic Background Glow on Hover */}
      <div className="absolute inset-0 -z-10 bg-radial-gradient from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-accent uppercase tracking-widest px-3 py-1 rounded-full bg-accent/5 border border-accent/10">
          {project.project_number}
        </span>
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-mono text-text-muted hover:text-accent transition-colors"
          >
            <span>GitHub Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>

      {/* Title & Summary */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-text-muted text-base leading-relaxed">
          {project.summary}
        </p>
      </div>

      {/* Details & Architecture Grid */}
      {project.details && project.details.length > 0 && (
        <div className="mt-2 space-y-4">
          <h4 className="text-sm font-semibold tracking-wide uppercase text-accent/90">
            Architecture &amp; Flow
          </h4>
          <ul className="grid gap-3.5">
            {project.details.map((detail, idx) => {
              const iconClass = detail.icon || 'fa-solid fa-circle-check';
              return (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-1 text-accent shrink-0">
                    <i className={iconClass} />
                  </span>
                  <div>
                    <strong className="text-foreground font-medium mr-1.5">
                      {detail.detail_title}:
                    </strong>
                    {detail.detail_description}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Core Tech Stack Section */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="mt-4 pt-4 border-t border-card-border flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-mono rounded bg-foreground/5 text-text-muted border border-foreground/5 hover:border-accent/20 hover:text-accent transition-all duration-300"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
