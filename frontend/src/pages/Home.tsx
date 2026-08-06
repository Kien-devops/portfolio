import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Calendar,
  Send,
  Loader2,
  CheckCircle,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../services/api.js";
import { Profile, Project, Skill, Experience, Education, BlogMetadata } from "../types/index.js";

export default function Home() {
  // State for data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [blogs, setBlogs] = useState<BlogMetadata[]>([]);

  // Page States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all portfolio data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Load in parallel
        const [profRes, projRes, skillRes, expRes, eduRes, blogRes] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getProjects().catch(() => []),
          api.getSkills().catch(() => []),
          api.getExperiences().catch(() => []),
          api.getEducation().catch(() => []),
          api.getBlogList().catch(() => []),
        ]);

        if (profRes) setProfile(profRes);
        setProjects(projRes);
        setSkills(skillRes);
        setExperiences(expRes);
        setEducation(eduRes);
        setBlogs(blogRes);
      } catch (err: any) {
        console.error("Error loading portfolio data:", err);
        setError("Could not load portfolio data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      await api.submitContact(formData);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      
      // Dynamic WOW effect: Fire confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#06b6d4"],
      });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc: Record<string, Skill[]>, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium">Loading premium portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <p className="font-semibold text-lg">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Set default profile if none exists in DynamoDB yet
  const displayProfile: Profile = profile || {
    name: "Alex Dev",
    headline: "Cloud & DevOps Serverless Architect",
    bio: "Passionate engineer specializing in designing AWS serverless microservices, highly resilient infrastructures, and responsive frontend applications.",
    email: "alex@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  };

  return (
    <div className="space-y-32">
      {/* ------------------ HERO SECTION ------------------ */}
      <section id="home" className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 flex flex-col items-center text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none radial-glow"></div>
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-8 animate-float">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>Open for Global Opportunities</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-display tracking-tight max-w-4xl leading-tight">
          Hi, I am <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{displayProfile.name}</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-300 dark:text-slate-200 mt-6 max-w-2xl font-medium tracking-wide">
          {displayProfile.headline}
        </p>
        
        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
          <button
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <span>View Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full border border-slate-700 bg-slate-900/40 text-slate-300 font-semibold hover:border-slate-500 hover:text-slate-100 transition-all cursor-pointer"
          >
            <span>Contact Me</span>
          </button>
        </div>

        {/* Social Bar */}
        <div className="flex space-x-6 mt-16 text-slate-400">
          {displayProfile.githubUrl && (
            <a href={displayProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">
              <Github className="w-6 h-6" />
            </a>
          )}
          {displayProfile.linkedinUrl && (
            <a href={displayProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          )}
          <a href={`mailto:${displayProfile.email}`} className="hover:text-slate-200 transition-colors">
            <Mail className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* ------------------ ABOUT SECTION ------------------ */}
      <section id="about" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Avatar frame */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <img
                src={displayProfile.avatarUrl}
                alt={displayProfile.name}
                className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
              />
            </div>
          </div>

          {/* Biography text */}
          <div className="md:col-span-8 space-y-6">
            <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              About Me
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Designing Scalable Architectures</h2>
            <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">
              {displayProfile.bio}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------ SKILLS SECTION ------------------ */}
      <section id="skills" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Expertise
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Technical Skillset</h2>
          <p className="text-slate-400">My toolbelt of technologies across frontend layers, cloud architecture, and database engineering.</p>
        </div>

        {Object.keys(skillsByCategory).length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500">
            No skills data available.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} className="p-6 rounded-2xl glass-panel relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent"></div>
                <h3 className="text-lg font-bold font-display mb-6 tracking-wide text-slate-200">{category}</h3>
                
                <div className="space-y-5">
                  {items.map((skill) => (
                    <div key={skill.skillId} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-300">{skill.name}</span>
                        <span className="text-indigo-400">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ EXPERIENCE SECTION ------------------ */}
      <section id="experience" className="max-w-4xl mx-auto px-6 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Work History</h2>
        </div>

        {experiences.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500">
            No work experience recorded.
          </div>
        ) : (
          <div className="relative border-l border-slate-900 space-y-12 pl-6 ml-4">
            {experiences.map((exp) => (
              <div key={exp.experienceId} className="relative group">
                {/* Timeline Icon */}
                <div className="absolute -left-[35px] top-1 p-1 bg-slate-950 border-2 border-indigo-500 rounded-full text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Briefcase className="w-4 h-4" />
                </div>

                <div className="p-6 rounded-2xl glass-panel hover:border-slate-800 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 font-display">{exp.position}</h3>
                      <p className="text-indigo-400 text-sm font-medium">{exp.company}</p>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-900/80 text-slate-400 text-xs font-medium border border-slate-800/60">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ EDUCATION SECTION ------------------ */}
      <section id="education" className="max-w-4xl mx-auto px-6 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Academics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Education</h2>
        </div>

        {education.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500">
            No education history recorded.
          </div>
        ) : (
          <div className="relative border-l border-slate-900 space-y-12 pl-6 ml-4">
            {education.map((edu) => (
              <div key={edu.educationId} className="relative group">
                <div className="absolute -left-[35px] top-1 p-1 bg-slate-950 border-2 border-indigo-500 rounded-full text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <GraduationCap className="w-4 h-4" />
                </div>

                <div className="p-6 rounded-2xl glass-panel hover:border-slate-800 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 font-display">{edu.major}</h3>
                      <p className="text-indigo-400 text-sm font-medium">{edu.school}</p>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-900/80 text-slate-400 text-xs font-medium border border-slate-800/60">
                      {edu.startDate} — {edu.endDate}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ PROJECTS SECTION ------------------ */}
      <section id="projects" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Portfolio
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Featured Projects</h2>
          <p className="text-slate-400">A collection of select software products, case studies, and serverless blueprints.</p>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500">
            No projects available.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div
                key={proj.projectId}
                className="rounded-2xl glass-panel hover:border-slate-800 overflow-hidden flex flex-col hover:scale-[1.01] transition-all group"
              >
                {/* Project Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={proj.imageUrl}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                </div>

                {/* Project Details */}
                <div className="p-6 flex-grow flex flex-col space-y-4">
                  <h3 className="text-lg font-bold text-slate-200 font-display">{proj.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed flex-grow">{proj.summary}</p>
                  
                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                    {proj.technologies.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
                        +{proj.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-900">
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold text-xs hover:bg-indigo-600 transition-colors cursor-pointer"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors text-xs cursor-pointer"
                      >
                        <span>Codebase</span>
                        <Github className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ BLOG LIST SECTION ------------------ */}
      <section id="blog" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Insights
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Technical Writing</h2>
          <p className="text-slate-400">Deep dives into Kubernetes patterns, cloud designs, and system architectures.</p>
        </div>

        {blogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500">
            No blog posts published yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.slug}
                className="rounded-2xl glass-panel hover:border-slate-800 overflow-hidden flex flex-col hover:scale-[1.01] transition-all group"
              >
                {/* Image */}
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                </div>

                {/* Info */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-200 leading-tight font-display hover:text-indigo-400 transition-colors">
                      <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{blog.summary}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                      {blog.tags[0] || "General"}
                    </span>
                    
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
                    >
                      <span>Read Post</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ CONTACT SECTION ------------------ */}
      <section id="contact" className="max-w-5xl mx-auto px-6 scroll-mt-24">
        <div className="grid md:grid-cols-12 gap-12 bg-slate-900/10 border border-slate-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Prompt Left */}
          <div className="md:col-span-5 space-y-6 relative z-10">
            <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Connect
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Get in touch</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Have a project blueprint, code question, or full-time deployment need? Fill out this contact form.
            </p>
            
            <div className="space-y-4 pt-6 text-sm text-slate-400">
              <a href={`mailto:${displayProfile.email}`} className="flex items-center space-x-3 hover:text-indigo-400 transition-colors">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>{displayProfile.email}</span>
              </a>
            </div>
          </div>

          {/* Form Right */}
          <div className="md:col-span-7 relative z-10">
            <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-form">
              {/* Honeypot field - website */}
              <div style={{ display: "none" }}>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-400">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-400">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    maxLength={254}
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-slate-400">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Collaborating on serverless project"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-slate-400">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  maxLength={2000}
                  placeholder="Write your request details here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm resize-none"
                ></textarea>
              </div>

              {/* Status Messages */}
              {submitSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Your message was sent successfully! I will get back to you soon.</span>
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                  <p className="font-semibold">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                id="submit-contact-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Delivering...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
