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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col gap-5 rounded-2xl border border-card-border bg-card p-7 md:p-8 backdrop-blur-md transition-all duration-400 hover:border-accent/30"
      style={{ boxShadow: 'none' }}
      whileHover={{ boxShadow: '0 0 40px -8px rgba(34,211,238,0.12)' }}
    >
      {/* Subtle left accent bar */}
      <div className="absolute left-0 top-8 bottom-8 w-[2px] rounded-r bg-accent/0 group-hover:bg-accent/50 transition-all duration-400" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-accent uppercase tracking-[0.18em] px-2.5 py-1 rounded-md bg-accent/8 border border-accent/15">
          {project.project_number}
        </span>
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-accent transition-colors"
          >
            <span>Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>

      {/* Title & Summary */}
      <div className="space-y-2.5">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-text-muted text-sm md:text-base leading-relaxed max-w-[65ch]">
          {project.summary}
        </p>
      </div>

      {/* Architecture details */}
      {project.details && project.details.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-accent/70">
            Architecture
          </span>
          <ul className="grid gap-2.5">
            {project.details.map((detail, idx) => {
              const iconClass = detail.icon || 'fa-solid fa-circle-check';
              return (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 text-accent/70 shrink-0 text-xs">
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

      {/* Tech stack */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="pt-4 border-t border-card-border flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-foreground/4 text-text-muted border border-foreground/6 hover:border-accent/25 hover:text-accent transition-all duration-250"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
