'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Briefcase, MapPin, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import ProjectCard from '@/components/ProjectCard';
import BlogCard from '@/components/BlogCard';
import { fetchProjects, fetchBlogs, fetchTimeline, Project, Blog, TimelineItem } from '@/utils/api';

// ─── Skill categories ─────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  {
    name: 'Cloud & Infrastructure',
    icon: 'fa-brands fa-aws',
    color: 'from-orange-500/10 to-transparent',
    accent: 'text-orange-400',
    skills: ['AWS', 'Amazon EKS', 'VPC Peering', 'IAM Security', 'ECR', 'Route53', 'Terraform', 'Ansible'],
    featured: true,
  },
  {
    name: 'Containers & Delivery',
    icon: 'fa-brands fa-docker',
    color: 'from-blue-500/10 to-transparent',
    accent: 'text-blue-400',
    skills: ['Docker', 'Kubernetes', 'Kustomize', 'Helm Charts', 'Argo CD', 'GitHub Actions', 'GitLab CI'],
    featured: false,
  },
  {
    name: 'Security & Quality',
    icon: 'fa-solid fa-shield-halved',
    color: 'from-red-500/10 to-transparent',
    accent: 'text-red-400',
    skills: ['Trivy Scan', 'SonarQube', 'Kyverno Rules', 'OWASP ZAP', 'IAM Policies', 'Network Policies'],
    featured: false,
  },
  {
    name: 'Observability & Scripting',
    icon: 'fa-solid fa-chart-line',
    color: 'from-emerald-500/10 to-transparent',
    accent: 'text-emerald-400',
    skills: ['Prometheus', 'Grafana', 'Loki Stack', 'Alertmanager', 'Bash Scripting', 'Python', 'NodeJS'],
    featured: false,
  },
];

// ─── Terminal lines for hero animation ───────────────────────────────────────
const TERMINAL_LINES = [
  { prompt: '$', cmd: 'kubectl get nodes --all-namespaces', delay: 0 },
  { prompt: '>', cmd: 'NAME        STATUS   ROLES    AGE   VERSION', delay: 0.6, output: true },
  { prompt: '>', cmd: 'eks-node-1  Ready    <none>   47d   v1.29.0', delay: 0.9, output: true },
  { prompt: '$', cmd: 'terraform apply -auto-approve', delay: 1.5 },
  { prompt: '>', cmd: 'Apply complete! 12 added, 0 changed, 0 destroyed.', delay: 2.1, output: true },
  { prompt: '$', cmd: 'argocd app sync production', delay: 2.7 },
  { prompt: '>', cmd: 'SYNCED  Healthy  production/api', delay: 3.2, output: true },
];

// ─── Fade-up animation variant ───────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// ─── TerminalBlock component ──────────────────────────────────────────────────
function TerminalBlock() {
  const reduce = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (reduce) { setVisibleLines(TERMINAL_LINES.length); return; }
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line) => {
      timers.push(setTimeout(() => setVisibleLines((n) => n + 1), (line.delay + 0.3) * 1000));
    });
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className="relative rounded-xl border border-white/8 bg-black/50 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6 bg-white/3">
        <span className="w-3 h-3 rounded-full bg-red-500/60" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <span className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-[11px] font-mono text-white/30 tracking-wider">devops — zsh</span>
      </div>
      {/* Lines */}
      <div className="p-5 space-y-2 font-mono text-[12px] leading-relaxed min-h-[220px]">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <span className={line.output ? 'text-white/25' : 'text-accent'}>
              {line.prompt}
            </span>
            <span className={line.output ? 'text-white/50' : 'text-white/85'}>
              {line.cmd}
            </span>
          </motion.div>
        ))}
        {/* Blinking cursor on last line */}
        {visibleLines >= TERMINAL_LINES.length && (
          <div className="flex gap-2">
            <span className="text-accent">$</span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(true);

  useEffect(() => {
    fetchProjects().then((data) => { setProjects(data); setProjectsLoading(false); });
    fetchBlogs().then((data) => { setBlogs(data.slice(0, 2)); setBlogsLoading(false); });
    fetchTimeline().then((data) => { setTimeline(data); setTimelineLoading(false); });
  }, []);

  const experiences    = timeline.filter((item) => item.type === 'experience');
  const certifications = timeline.filter((item) => item.type === 'certification');

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-28 pb-24 space-y-32 md:space-y-40">

        {/* ── HERO: Split-screen ─────────────────────────────────────────── */}
        <section id="about" className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[100dvh] -mt-8 pt-16 md:pt-0">
          {/* Left: content */}
          <div className="space-y-7">
            {/* Single eyebrow — HERO (eyebrow 1/3) */}
            <motion.div
              {...fadeUp(0.1)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/8 border border-accent/20 text-accent text-[11px] font-mono tracking-widest uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Available for Consulting
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-foreground"
            >
              Hi, I'm{' '}
              <span className="text-gradient">Kien Nguyen</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.3)}
              className="text-base md:text-lg text-text-muted leading-relaxed max-w-[48ch]"
            >
              DevOps &amp; DevSecOps Engineer. Secure EKS clusters, GitOps deployments, shift-left security.
            </motion.p>

            <motion.div
              {...fadeUp(0.4)}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-black font-bold text-sm transition-all duration-250 active:scale-[0.98]"
              >
                View Work
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-card-border hover:border-accent/40 text-foreground font-semibold text-sm transition-all duration-250 active:scale-[0.98]"
              >
                <Mail className="w-4 h-4 text-accent" />
                Contact
              </a>
            </motion.div>
          </div>

          {/* Right: Terminal block */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <TerminalBlock />
          </motion.div>
        </section>

        {/* ── CERTIFICATIONS: horizontal scroll-snap strip ────────────────── */}
        <section className="space-y-6">
          <motion.h2
            {...fadeUp(0)}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Industry Certifications
          </motion.h2>

          {timelineLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-none h-20 w-72 rounded-xl bg-card border border-card-border/80 animate-pulse" />
              ))}
            </div>
          ) : certifications.length === 0 ? (
            <p className="text-text-muted text-sm font-mono">No certifications found.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4">
              {certifications.map((cert) => (
                <a
                  key={cert.id}
                  href={cert.badge_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group snap-start flex-none flex items-center gap-4 px-5 py-4 rounded-xl border border-card-border bg-card hover:border-accent/35 transition-all duration-300 w-72"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <i className={`${cert.icon || 'fa-brands fa-aws text-2xl text-orange-400'} group-hover:scale-105 transition-transform`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {cert.title}
                    </p>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5 truncate">
                      {cert.issuer}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── BIO/PHILOSOPHY: Full-width editorial quote ──────────────────── */}
        <section className="relative">
          <motion.div
            {...fadeUp(0)}
            className="border-l-2 border-accent pl-8 py-2 space-y-4 max-w-3xl"
          >
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-[1.2]">
              "Quiet operations, zero drift."
            </p>
            <div className="text-text-muted text-sm md:text-base leading-relaxed space-y-3 max-w-[60ch]">
              <p>
                Platform architectures built on minimal noise and maximum stability. In enterprise DevOps, reliable scaling is quiet, predictable, and fully codified.
              </p>
              <p>
                From hardening container security boundaries to orchestrating cross-region VPC gateways — deterministic systems, clean environments, every time.
              </p>
            </div>
            <span className="accent-line" />
          </motion.div>
        </section>

        {/* ── EXPERIENCE: Timeline ────────────────────────────────────────── */}
        <section id="experience" className="space-y-10">
          <motion.h2
            {...fadeUp(0)}
            className="text-2xl md:text-3xl font-black tracking-tight text-foreground"
          >
            Professional Timeline
          </motion.h2>

          <div className="space-y-10">
            {timelineLoading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-0.5 bg-foreground/8 rounded self-stretch" />
                    <div className="flex-1 space-y-2 pb-8">
                      <div className="h-5 bg-foreground/10 rounded w-1/3" />
                      <div className="h-3 bg-foreground/10 rounded w-1/4" />
                      <div className="h-12 bg-foreground/10 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <p className="text-text-muted text-sm font-mono">No experiences found.</p>
            ) : (
              experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id || idx}
                  {...fadeUp(idx * 0.08)}
                  className="group relative pl-6 border-l border-card-border hover:border-accent/30 transition-colors duration-300"
                >
                  {/* Dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card-border bg-background group-hover:border-accent transition-colors duration-300" />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        {exp.role}
                      </h3>
                      <span className="text-[11px] font-mono text-accent bg-accent/8 px-2 py-0.5 rounded border border-accent/12">
                        {exp.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {exp.company}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-muted leading-relaxed max-w-[65ch] pt-1">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* ── SKILLS: Bento grid (eyebrow 2/3) ───────────────────────────── */}
        <section id="skills" className="space-y-8">
          <motion.div {...fadeUp(0)} className="space-y-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-accent">
              Expertise
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Technical Skillsets
            </h2>
          </motion.div>

          {/* Bento: 2-col desktop. Featured cell (Cloud) spans both cols on mobile, half on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.name}
                {...fadeUp(idx * 0.07)}
                className={`bento-cell p-6 space-y-4 relative overflow-hidden ${cat.featured ? 'md:col-span-2' : ''}`}
              >
                {/* Background gradient per category */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} pointer-events-none`} />

                <div className="relative flex items-center gap-3">
                  <span className={`text-xl ${cat.accent}`}>
                    <i className={cat.icon} />
                  </span>
                  <h3 className="text-sm font-mono font-semibold text-foreground/80 uppercase tracking-wider">
                    {cat.name}
                  </h3>
                </div>

                <div className="relative flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-foreground/5 text-text-muted border border-foreground/6 hover:border-accent/25 hover:text-accent transition-all duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PROJECTS ────────────────────────────────────────────────────── */}
        <section id="projects" className="space-y-8">
          <motion.h2
            {...fadeUp(0)}
            className="text-2xl md:text-3xl font-black tracking-tight text-foreground"
          >
            Selected Projects
          </motion.h2>

          <div className="grid grid-cols-1 gap-6">
            {projectsLoading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-card border border-card-border rounded-2xl text-text-muted text-sm font-mono">
                No projects found.
              </div>
            ) : (
              projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))
            )}
          </div>
        </section>

        {/* ── BLOGS ───────────────────────────────────────────────────────── */}
        <section id="blogs" className="space-y-8">
          <motion.div
            {...fadeUp(0)}
            className="flex flex-col md:flex-row md:items-baseline justify-between gap-4"
          >
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Latest Articles
            </h2>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
            >
              All Articles
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogsLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80 animate-pulse" />
              ))
            ) : blogs.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-card border border-card-border rounded-2xl text-text-muted text-sm font-mono">
                No articles found.
              </div>
            ) : (
              blogs.map((blog, index) => (
                <BlogCard key={blog.id} blog={blog} index={index} />
              ))
            )}
          </div>
        </section>

        {/* ── CONTACT: split layout, no center (eyebrow 3/3) ─────────────── */}
        <section id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: text */}
          <motion.div {...fadeUp(0)} className="space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-accent">
              Contact
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Get in Touch
            </h2>
            <p className="text-text-muted text-sm md:text-base leading-relaxed max-w-[38ch]">
              Infrastructure questions, Kubernetes tuning, or want to discuss security? I'm available.
            </p>
            <span className="accent-line block" />
          </motion.div>

          {/* Right: contact links */}
          <motion.div {...fadeUp(0.1)} className="space-y-3">
            {[
              {
                icon: <Mail className="w-4 h-4" />,
                label: 'Email',
                value: 'kiennguly24@gmail.com',
                href: 'mailto:kiennguly24@gmail.com',
              },
              {
                icon: <i className="fa-brands fa-github text-base" />,
                label: 'GitHub',
                value: '@Kien-devops',
                href: 'https://github.com/Kien-devops',
                external: true,
              },
              {
                icon: <i className="fa-brands fa-linkedin text-base" />,
                label: 'LinkedIn',
                value: 'Kien Nguyen',
                href: 'https://www.linkedin.com/in/kien-vpc-peering/',
                external: true,
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card hover:border-accent/35 transition-all duration-250"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate block">
                    {item.value}
                  </span>
                </div>
                {item.external && (
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors shrink-0" />
                )}
              </a>
            ))}
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  );
}
