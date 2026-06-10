'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Mail, Shield, Award, Calendar, MapPin, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import ProjectCard from '@/components/ProjectCard';
import BlogCard from '@/components/BlogCard';
import { fetchProjects, fetchBlogs, fetchTimeline, Project, Blog, TimelineItem } from '@/utils/api';

const SKILL_CATEGORIES = [
  {
    name: 'Cloud & Infrastructure',
    skills: ['AWS', 'Amazon EKS', 'VPC Peering', 'IAM Security', 'ECR', 'Route53', 'Terraform', 'Ansible']
  },
  {
    name: 'Containers & Delivery',
    skills: ['Docker', 'Kubernetes', 'Kustomize', 'Helm Charts', 'Argo CD', 'GitHub Actions', 'GitLab CI']
  },
  {
    name: 'Security & Quality',
    skills: ['Trivy Scan', 'SonarQube', 'Kyverno Rules', 'OWASP ZAP', 'IAM Policies', 'Network Policies']
  },
  {
    name: 'Observability & Logic',
    skills: ['Prometheus', 'Grafana', 'Loki Stack', 'Alertmanager', 'Bash Scripting', 'Python', 'NodeJS']
  }
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(true);

  useEffect(() => {
    fetchProjects().then((data) => {
      setProjects(data);
      setProjectsLoading(false);
    });
    fetchBlogs().then((data) => {
      setBlogs(data.slice(0, 2)); // Show latest 2 articles on landing page
      setBlogsLoading(false);
    });
    fetchTimeline().then((data) => {
      setTimeline(data);
      setTimelineLoading(false);
    });
  }, []);

  const experiences = timeline.filter((item) => item.type === 'experience');
  const certifications = timeline.filter((item) => item.type === 'certification');

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-28 md:space-y-36">
        {/* HERO SECTION */}
        <section id="about" className="relative flex flex-col md:flex-row items-center gap-12 pt-8 md:pt-16">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Available for Consulting</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-foreground">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Kien Devops</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-xl mx-auto md:mx-0 font-medium">
              DevOps &amp; DevSecOps Engineer. Specializing in secure, high-availability EKS cluster topographies, declarative GitOps deployments, and shift-left security.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <span>View My Works</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground border border-card-border font-bold text-sm transition-all duration-300 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>Contact Me</span>
              </a>
            </div>
          </div>

          {/* Avatar Orb Graphics */}
          <div className="relative shrink-0 select-none">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full bg-card border-4 border-card-border/80 flex items-center justify-center shadow-2xl transition-transform duration-700 hover:rotate-3 overflow-hidden">
              <div className="text-center space-y-1">
                <span className="block font-sans text-5xl md:text-6xl font-black text-accent tracking-tighter">KN</span>
                <span className="block font-mono text-[9px] text-text-muted uppercase tracking-widest">
                  vpc // peering // security
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFIED CREDENTIALS / CERTIFICATIONS */}
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Credentials
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Industry Certifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {timelineLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-card border border-card-border/80 flex items-center p-6 animate-pulse gap-5">
                  <div className="w-14 h-14 rounded-xl bg-foreground/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-foreground/10 rounded w-2/3" />
                    <div className="h-3 bg-foreground/10 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : certifications.length === 0 ? (
              <div className="col-span-full text-center py-6 text-text-muted text-sm font-mono bg-card border border-card-border rounded-2xl">
                No certifications found.
              </div>
            ) : (
              certifications.map((cert) => (
                <a
                  key={cert.id}
                  href={cert.badge_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 md:p-6 bg-card border border-card-border hover:border-accent/40 rounded-2xl flex items-center gap-5 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <i className={`${cert.icon || "fa-brands fa-aws text-3xl text-orange-400"} group-hover:scale-105 transition-transform`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-1">
                      {cert.issuer}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>

        {/* BIO & PHILOSOPHY */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              The Philosophy
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Decisive Execution
            </h2>
          </div>
          <div className="md:col-span-8 bg-card border border-card-border rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              "Quiet Operations, Zero Drift."
            </h3>
            <div className="text-text-muted text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                I design platform architectures under the principle of minimal noise and maximum stability. In enterprise DevOps, reliable scaling is not loud; it is quiet, predictable, and fully codified.
              </p>
              <p>
                From hardening container security boundaries to orchestrating secure cross-region VPC gateways, my focus is strictly on engineering deterministic systems that protect access control layers. By pairing declarative infrastructure declarations with live drift tracking, we guarantee clean, reliable environments.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE EXPERIENCE */}
        <section id="experience" className="space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Career History
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Professional Timeline
            </h2>
          </div>

          <div className="relative border-l border-card-border pl-6 ml-4 space-y-12">
            {timelineLoading ? (
              <div className="space-y-8 animate-pulse pl-6">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-6 bg-foreground/10 rounded w-1/3" />
                    <div className="h-4 bg-foreground/10 rounded w-1/4" />
                    <div className="h-12 bg-foreground/10 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-sm font-mono">
                No experiences found.
              </div>
            ) : (
              experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-accent bg-background transition-colors group-hover:bg-accent" />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        {exp.role}
                      </h3>
                      <span className="text-xs font-mono text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                        {exp.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{exp.company}</span>
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{exp.location}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-text-muted leading-relaxed font-medium pt-1">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SKILLS MAP GRID */}
        <section id="skills" className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Expertise Matrix
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Technical Skillsets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map((category) => (
              <div key={category.name} className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono font-semibold text-accent uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-mono rounded-lg bg-foreground/5 text-text-muted border border-foreground/5 hover:border-accent/30 hover:text-accent transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SELECTED WORKS / PROJECTS GRID */}
        <section id="projects" className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Case Studies
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Selected Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {projectsLoading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80 flex flex-col justify-between p-6 md:p-8">
                    <div className="space-y-4">
                      <div className="w-24 h-4 bg-foreground/10 rounded" />
                      <div className="w-2/3 h-8 bg-foreground/10 rounded" />
                      <div className="w-full h-4 bg-foreground/10 rounded" />
                      <div className="w-5/6 h-4 bg-foreground/10 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-foreground/15 rounded-lg" />
                      <div className="w-16 h-6 bg-foreground/15 rounded-lg" />
                      <div className="w-16 h-6 bg-foreground/15 rounded-lg" />
                    </div>
                  </div>
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

        {/* LATEST WRITINGS / BLOGS GRID */}
        <section id="blogs" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                Writings
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                Latest Articles
              </h2>
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              <span>VIEW ALL ARTICLES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogsLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80 flex flex-col justify-between p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-foreground/10" />
                    <div className="w-3/4 h-6 bg-foreground/10 rounded" />
                    <div className="w-full h-4 bg-foreground/10 rounded" />
                    <div className="w-5/6 h-4 bg-foreground/10 rounded" />
                  </div>
                  <div className="w-20 h-4 bg-foreground/10 rounded" />
                </div>
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

        {/* CONTACT SECTION */}
        <section id="contact" className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Connect With Me
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Get In Touch
            </h2>
            <p className="text-text-muted max-w-md mx-auto text-sm md:text-base font-medium">
              Have an infrastructure design concern, Kubernetes tuning issue, or want to discuss security? Send me a message!
            </p>
          </div>

          <div className="max-w-md mx-auto bg-card border border-card-border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <a
                href="mailto:kiennguly24@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl border border-card-border/80 hover:border-accent/40 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-text-muted uppercase">Email Address</span>
                  <span className="text-sm font-semibold">kiennguly24@gmail.com</span>
                </div>
              </a>

              <a
                href="https://github.com/Kien-devops"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-card-border/80 hover:border-accent/40 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <i className="fa-brands fa-github text-xl" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-text-muted uppercase">GitHub Profile</span>
                  <span className="text-sm font-semibold">@Kien-devops</span>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/kien-vpc-peering/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-card-border/80 hover:border-accent/40 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <i className="fa-brands fa-linkedin text-xl" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-text-muted uppercase">LinkedIn Profile</span>
                  <span className="text-sm font-semibold">Kien Devops</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
