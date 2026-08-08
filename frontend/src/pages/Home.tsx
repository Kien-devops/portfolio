import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  X,
  ExternalLink,
  GitBranch,
  Terminal as TerminalIcon,
  Clock,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../services/api.js";
import { Profile, Project, Skill, Experience, Education, BlogMetadata, HandsonMetadata } from "../types/index.js";

export default function Home() {
  // State for data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [blogs, setBlogs] = useState<BlogMetadata[]>([]);
  const [handsonLabs, setHandsonLabs] = useState<HandsonMetadata[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);


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
        const [profRes, projRes, skillRes, expRes, eduRes, blogRes, handsonRes] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getProjects().catch(() => []),
          api.getSkills().catch(() => []),
          api.getExperiences().catch(() => []),
          api.getEducation().catch(() => []),
          api.getBlogList().catch(() => []),
          api.getHandsonList().catch(() => []),
        ]);

        if (profRes) setProfile(profRes);
        setProjects(projRes);
        setSkills(skillRes);
        setExperiences(expRes);
        setEducation(eduRes);
        setBlogs(blogRes);
        setHandsonLabs(handsonRes);

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

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#2563eb", "#111111", "#666666"],
      });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 font-mono bg-[#ffffff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        <p className="text-[#666666] text-sm">loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4 font-mono bg-[#ffffff]">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-[#e5e5e5] text-[#111111] hover:text-[#2563eb] text-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Profile default data
  const displayProfile: Profile = profile || {
    name: "Nguyễn Trung Kiên",
    headline: "DevOps & Cloud Engineer",
    bio: "I build AWS infrastructure, Kubernetes platforms and delivery automation.\n\nMost of my recent work focuses on EKS, Terraform, GitOps delivery and container security.",
    email: "kien07493@gmail.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/180655698?v=4",
    githubUrl: "https://github.com/Kien-devops",
    linkedinUrl: "https://linkedin.com/in/trungkien-devops",
  };

  // Stack categories for editorial layout
  const defaultStack = [
    { category: "Cloud", items: "AWS / EKS / ECS / Lambda / VPC / IAM" },
    { category: "Infrastructure", items: "Terraform / Ansible" },
    { category: "Containers", items: "Kubernetes / Docker / Helm / Kustomize" },
    { category: "Delivery", items: "Argo CD / GitHub Actions / GitLab CI" },
    { category: "Security", items: "Kyverno / Trivy / Falco / SonarQube" },
    { category: "Observability", items: "Prometheus / Grafana / Loki" },
    { category: "Languages", items: "Bash / Python / TypeScript / Node.js" },
  ];

  const stackCategories = skills.length > 0
    ? Object.entries(
        skills.reduce((acc: Record<string, string[]>, skill) => {
          const cat = skill.category || "General";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(skill.name);
          return acc;
        }, {})
      ).map(([category, items]) => ({ category, items: items.join(" / ") }))
    : defaultStack;

  // Curated experiences list
  const displayExperiences = experiences.length > 0 ? experiences : [
    {
      experienceId: "cert-saa",
      company: "Amazon Web Services (AWS)",
      position: "AWS Certified Solutions Architect – Associate",
      startDate: "2026",
      endDate: "2029",
      description: "Chứng nhận năng lực thiết kế kiến trúc hệ thống phân tán, có tính khả dụng cao và bảo mật trên AWS. Thiết kế Well-Architected Framework: VPC multi-AZ, Auto Scaling, EKS/ECS, RDS Multi-AZ, CloudFront, Route 53 và IAM Least Privilege.",
      credlyUrl: "https://www.credly.com/badges/fb64362a-24b4-4006-bc6d-d7fd1428a9e1",
      displayOrder: 1
    },
    {
      experienceId: "cert-dva",
      company: "Amazon Web Services (AWS)",
      position: "AWS Certified Developer – Associate",
      startDate: "2026",
      endDate: "2029",
      description: "Xác nhận kỹ năng phát triển, deploy và debug ứng dụng cloud-native trên AWS. Kỹ năng bao gồm AWS SDKs/APIs, Lambda, API Gateway, DynamoDB, SQS/SNS, Cognito và AWS SAM framework.",
      credlyUrl: "https://www.credly.com/badges/e3fdcd6b-e0b5-420e-9dde-993c89617e19",
      displayOrder: 2
    },
    {
      experienceId: "cert-ccp",
      company: "Amazon Web Services (AWS)",
      position: "AWS Certified Cloud Practitioner",
      startDate: "2026",
      endDate: "2029",
      description: "Nền tảng hiểu biết toàn diện về dịch vụ đám mây, mô hình định giá, bảo mật và kiến trúc AWS. Xác nhận thành thạo các dịch vụ core: EC2, S3, IAM, VPC, RDS và CloudWatch.",
      credlyUrl: "https://www.credly.com/badges/74d3175c-1eda-4ee4-ac65-dfb0cc552706",
      displayOrder: 3
    }
  ];

  // Curated projects list
  const displayProjects = projects.length > 0 ? projects : [
    {
      projectId: "proj-1",
      name: "Hospital On-Premise DevSecOps GitOps Platform",
      summary: "Production-grade DevSecOps & GitOps platform cho ứng dụng quản lý bệnh viện: On-premise Kubernetes, Argo CD, SonarQube, Trivy, Kyverno, Falco & full observability stack.",
      description: "Hệ thống DevSecOps và GitOps hoàn chỉnh cho ứng dụng quản lý bệnh viện (React/Vite frontend + ASP.NET Core 9 backend) triển khai trên Kubernetes on-premise.\n\nPipeline CI/CD qua GitHub Actions (tích hợp qua Tailscale): build → SonarQube quality gate → Trivy filesystem scan → Nexus artifacts → Docker image build → Trivy image scan → deploy GitOps qua Argo CD Root App-of-Apps.\n\nBảo mật cluster & runtime với Kyverno policies, Trivy Operator và Falco detection. Full-stack observability: Prometheus metrics, Grafana dashboards, Alertmanager, Loki logs và Promtail.",
      technologies: ["Kubernetes", "Argo CD", "GitHub Actions", "Kyverno", "Falco", "Trivy", "SonarQube", "Prometheus", "Grafana", "Loki", "React", "ASP.NET Core", "Nexus"],
      githubUrl: "https://github.com/Kien-devops/k8s-home",
      demoUrl: "",
      imageUrl: "https://raw.githubusercontent.com/Kien-devops/k8s-home/main/k8s-home-full-diagram.png",
      published: true,
      slug: "hospital-devsecops-platform",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
      displayOrder: 1
    },
    {
      projectId: "proj-2",
      name: "Hybrid DevOps E-Commerce AWS Platform",
      summary: "Hạ tầng E-Commerce hybrid cloud-native trên AWS: ECS Fargate containers, Terraform IaC, AWS SAM serverless (SNS/SQS/Lambda) và GitHub Actions CI/CD.",
      description: "Hệ thống E-Commerce cloud-native production-ready kết hợp containerized microservices trên AWS ECS Fargate, xử lý sự kiện bất đồng bộ serverless với AWS SAM (SNS, SQS, S3, Node.js Lambdas) và quản lý 100% hạ tầng mạng (VPC, ALB, ECR, ECS) bằng Terraform IaC.\n\nPipeline CI/CD tự động qua 4 GitHub Actions workflows: Terraform infra check, SAM serverless deploy, Express backend container test & Trivy image scan, và React frontend rolling deploy lên ECS Fargate.",
      technologies: ["Terraform", "AWS ECS", "AWS SAM", "AWS Lambda", "Docker", "GitHub Actions", "SNS", "SQS", "Express.js", "React", "Trivy"],
      githubUrl: "https://github.com/Kien-devops/sam-iac-project",
      demoUrl: "",
      imageUrl: "https://raw.githubusercontent.com/Kien-devops/sam-iac-project/main/docs/project_architecture_diagram.png",
      published: true,
      slug: "hybrid-ecommerce-aws-platform",
      createdAt: "2026-08-02",
      updatedAt: "2026-08-02",
      displayOrder: 2
    }
  ];

  return (
    <div className="w-full bg-[#ffffff] text-[#111111]">

      {/* ------------------ HERO SECTION (#FFFFFF) ------------------ */}
      <section id="home" className="bg-[#ffffff] pt-28 sm:pt-36 pb-20 border-b border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#111111] leading-[0.95] -tracking-[0.045em] uppercase">
                  NGUYỄN<br />TRUNG KIÊN
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-[#111111] pt-1 font-sans">
                  DevOps & Cloud Engineer
                </p>
              </div>

              <p className="text-base sm:text-lg text-[#666666] max-w-lg leading-relaxed font-sans">
                I build AWS infrastructure, Kubernetes platforms and delivery automation.
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-[#666666]">
                <span>Vietnam</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 text-[#2563eb] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
                  Available for consulting
                </span>
              </div>

              {/* Social links - text links */}
              <div className="flex items-center space-x-6 pt-4 font-mono text-sm">
                {displayProfile.githubUrl && (
                  <a
                    href={displayProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] hover:text-[#2563eb] font-medium transition-colors"
                  >
                    GitHub ↗
                  </a>
                )}
                {displayProfile.linkedinUrl && (
                  <a
                    href={displayProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] hover:text-[#2563eb] font-medium transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                )}
                <a
                  href={`mailto:${displayProfile.email}`}
                  className="text-[#111111] hover:text-[#2563eb] font-medium transition-colors"
                >
                  Email ↗
                </a>
              </div>
            </div>

            {/* Right Column Terminal Window */}
            <div className="lg:col-span-5">
              <div className="terminal-window p-4 space-y-4">
                {/* Terminal Titlebar */}
                <div className="terminal-header -mx-4 -mt-4 px-4 py-2.5 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-[#8a8a8a] flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>~/kien</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#333333] inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#333333] inline-block"></span>
                  </div>
                </div>

                {/* Terminal Commands Output */}
                <div className="space-y-3 font-mono text-xs leading-relaxed text-[#f5f5f5] pt-1">
                  <div>
                    <span className="text-[#2563eb]">$ </span>
                    <span className="text-white">whoami</span>
                    <p className="text-[#8a8a8a] pl-2 pt-0.5">kien</p>
                  </div>
                  <div>
                    <span className="text-[#2563eb]">$ </span>
                    <span className="text-white">stack</span>
                    <div className="text-[#f5f5f5] pl-2 pt-0.5 space-y-0.5">
                      <p>AWS</p>
                      <p>Kubernetes</p>
                      <p>Terraform</p>
                      <p>GitOps</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 pt-1 text-slate-400">
                    <span className="text-[#2563eb]">$ </span>
                    <span className="w-2 h-4 bg-[#2563eb] inline-block animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------ 01 / ABOUT & CERTIFICATIONS (#FFFFFF) ------------------ */}
      <section id="about" className="bg-[#ffffff] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="grid md:grid-cols-12 gap-10">
            {/* About Bio */}
            <div className="md:col-span-7 space-y-5">
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
                <span className="text-[#2563eb] mr-2">01 /</span>ABOUT
              </h2>
              <div className="text-base text-[#666666] leading-relaxed font-sans space-y-4 whitespace-pre-line">
                {displayProfile.bio}
              </div>
            </div>

            {/* Certifications list */}
            <div className="md:col-span-5 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
                Certifications
              </h2>

              <div className="space-y-4 border-t border-[#e5e5e5] pt-4">
                <div className="border-b border-[#e5e5e5] pb-4 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-[#111111] font-semibold">AWS Certified Solutions Architect — Associate</div>
                    <div className="text-[#8a8a8a] text-[11px] pt-0.5">Issued 2026 · Credly Verified</div>
                  </div>
                  <a
                    href="https://www.credly.com/badges/fb64362a-24b4-4006-bc6d-d7fd1428a9e1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563eb] hover:underline font-semibold flex items-center gap-1"
                  >
                    Verify ↗
                  </a>
                </div>

                <div className="border-b border-[#e5e5e5] pb-4 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-[#111111] font-semibold">AWS Certified Developer — Associate</div>
                    <div className="text-[#8a8a8a] text-[11px] pt-0.5">Issued 2026 · Credly Verified</div>
                  </div>
                  <a
                    href="https://www.credly.com/badges/e3fdcd6b-e0b5-420e-9dde-993c89617e19"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563eb] hover:underline font-semibold flex items-center gap-1"
                  >
                    Verify ↗
                  </a>
                </div>

                <div className="border-b border-[#e5e5e5] pb-4 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-[#111111] font-semibold">AWS Certified Cloud Practitioner</div>
                    <div className="text-[#8a8a8a] text-[11px] pt-0.5">Issued 2026 · Credly Verified</div>
                  </div>
                  <a
                    href="https://www.credly.com/badges/74d3175c-1eda-4ee4-ac65-dfb0cc552706"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563eb] hover:underline font-semibold flex items-center gap-1"
                  >
                    Verify ↗
                  </a>
                </div>
              </div>

              {education.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
                    Academics
                  </h2>
                  {education.map((edu) => (
                    <div key={edu.educationId} className="border-b border-[#e5e5e5] pb-3 text-xs font-mono space-y-0.5">
                      <div className="text-[#111111] font-semibold">{edu.major}</div>
                      <div className="text-[#8a8a8a]">{edu.school} ({edu.startDate} — {edu.endDate})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ------------------ 02 / WORK (#FFFFFF) ------------------ */}
      <section id="projects" className="bg-[#ffffff] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
              <span className="text-[#2563eb] mr-2">02 /</span>WORK
            </h2>
          </div>

          <div className="border-t border-[#e5e5e5]">
            {displayProjects.map((proj, idx) => (
              <div key={proj.projectId || idx} className="border-b border-[#e5e5e5] py-10 group">
                <div className="grid md:grid-cols-12 gap-6 items-start">
                  
                  {/* Project Number */}
                  <div className="md:col-span-1 font-mono text-base font-bold text-[#2563eb]">
                    0{idx + 1}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-11 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h3 className="text-2xl font-bold text-[#111111] group-hover:text-[#2563eb] transition-colors">
                        {proj.name}
                      </h3>

                      <div className="flex items-center space-x-4 font-mono text-xs">
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="text-[#111111] hover:text-[#2563eb] transition-colors cursor-pointer font-semibold"
                        >
                          View ↗
                        </button>
                      </div>
                    </div>

                    <p className="text-[#666666] text-sm leading-relaxed max-w-2xl font-sans">
                      {proj.summary || proj.description}
                    </p>

                    {/* Square 4px tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {proj.technologies.map((tech) => (
                        <span key={tech} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ 03 / CERTIFICATIONS (#FFFFFF) ------------------ */}
      <section id="experience" className="bg-[#ffffff] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111] mb-12">
            <span className="text-[#2563eb] mr-2">03 /</span>CERTIFICATIONS
          </h2>

          <div className="border-t border-[#e5e5e5]">
            {displayExperiences.map((exp, idx) => (
              <div key={exp.experienceId || idx} className="border-b border-[#e5e5e5] py-8">
                <div className="grid md:grid-cols-12 gap-4 items-start">
                  
                  {/* Dates */}
                  <div className="md:col-span-3 font-mono text-xs font-semibold text-[#666666] pt-1">
                    {exp.startDate} — {exp.endDate || "PRESENT"}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-9 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-bold text-[#111111]">
                          {exp.company}
                        </h3>
                        <p className="font-mono text-xs text-[#2563eb] font-medium">
                          {exp.position}
                        </p>
                      </div>
                      {(exp as any).credlyUrl && (
                        <a
                          href={(exp as any).credlyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-[#2563eb] hover:underline font-semibold flex items-center gap-1 shrink-0"
                        >
                          Credly Badge ↗
                        </a>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-[#666666] leading-relaxed font-sans pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ 04 / STACK (#FFFFFF) ------------------ */}
      <section id="stack" className="bg-[#ffffff] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111] mb-10">
            <span className="text-[#2563eb] mr-2">04 /</span>STACK
          </h2>

          <div className="border-t border-[#e5e5e5]">
            {stackCategories.map((row, idx) => (
              <div key={idx} className="py-4 border-b border-[#e5e5e5] grid grid-cols-12 text-sm items-center">
                <div className="col-span-5 sm:col-span-4 font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
                  {row.category}
                </div>
                <div className="col-span-7 sm:col-span-8 font-sans text-[#666666] text-sm">
                  {row.items}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ 05 / HANDS-ON LABS (#FAFAFA) ------------------ */}
      <section id="handson" className="bg-[#fafafa] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
              <span className="text-[#2563eb] mr-2">05 /</span>HANDS-ON LABS
            </h2>
            <Link
              to="/handson"
              className="font-mono text-xs text-[#2563eb] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Xem tất cả Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {handsonLabs.slice(0, 3).map((lab) => (
              <div
                key={lab.slug}
                className="bg-[#ffffff] border border-[#e5e5e5] rounded-lg p-6 flex flex-col justify-between hover:border-[#2563eb]/50 hover:shadow-sm transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="bg-[#2563eb] text-white px-2 py-0.5 rounded font-semibold uppercase">
                      {lab.category}
                    </span>
                    <div className="flex items-center space-x-1 text-[#666666]">
                      <Clock className="w-3 h-3 text-[#2563eb]" />
                      <span>{lab.estimatedTime}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#111111] group-hover:text-[#2563eb] transition-colors font-sans line-clamp-2">
                    {lab.title}
                  </h3>

                  <p className="text-xs text-[#666666] line-clamp-3 font-sans leading-relaxed">
                    {lab.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#f0f0f0]">
                  <Link
                    to={`/handson/${lab.slug}`}
                    className="w-full inline-flex items-center justify-between font-mono text-xs font-semibold text-[#111111] group-hover:text-[#2563eb] transition-colors"
                  >
                    <span>Làm Theo Guide</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ 06 / BLOGS (#FFFFFF) ------------------ */}
      <section id="blog" className="bg-[#ffffff] py-20 border-b border-[#e5e5e5] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111] mb-10">
            <span className="text-[#2563eb] mr-2">06 /</span>BLOGS
          </h2>


          {blogs.length === 0 ? (
            <div className="border-t border-[#e5e5e5]">
              <div className="py-6 border-b border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#666666]">07 AUG 2026</div>
                  <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#2563eb] transition-colors">
                    Building a Serverless Portfolio on AWS
                  </h3>
                </div>
                <div className="font-mono text-xs text-[#666666] flex items-center gap-2">
                  <span>S3 / CloudFront / Lambda / DynamoDB</span>
                  <span className="group-hover:text-[#2563eb] transition-colors">↗</span>
                </div>
              </div>

              <div className="py-6 border-b border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#666666]">04 AUG 2026</div>
                  <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#2563eb] transition-colors">
                    Caching Maven dependencies with CodeArtifact
                  </h3>
                </div>
                <div className="font-mono text-xs text-[#666666] flex items-center gap-2">
                  <span>AWS / Maven</span>
                  <span className="group-hover:text-[#2563eb] transition-colors">↗</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-[#e5e5e5]">
              {blogs.map((blog) => (
                <div key={blog.slug} className="py-6 border-b border-[#e5e5e5] group">
                  <Link to={`/blog/${blog.slug}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-[#666666]">
                        {new Date(blog.publishedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }).toUpperCase()}
                      </div>
                      <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#2563eb] transition-colors">
                        {blog.title}
                      </h3>
                    </div>

                    <div className="font-mono text-xs text-[#666666] flex items-center gap-2 shrink-0">
                      <span>{blog.tags[0] || "General"}</span>
                      <span className="group-hover:text-[#2563eb] transition-colors">↗</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------ CONTACT SECTION (#FFFFFF) ------------------ */}
      <section id="contact" className="bg-[#ffffff] py-16 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-2">
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#111111]">
                Contact
              </h2>
              <h3 className="text-3xl font-bold text-[#111111]">Get in touch</h3>
              <p className="text-sm text-[#666666]">
                Send a message or reach out directly at <a href={`mailto:${displayProfile.email}`} className="text-[#2563eb] font-semibold underline">{displayProfile.email}</a>.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-form">
              {/* Honeypot */}
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
                <div className="space-y-1.5">
                  <label htmlFor="name" className="font-mono text-xs text-[#111111] font-semibold">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pure-white-input w-full px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="font-mono text-xs text-[#111111] font-semibold">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    maxLength={254}
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pure-white-input w-full px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="font-mono text-xs text-[#111111] font-semibold">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="AWS & Kubernetes deployment inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="pure-white-input w-full px-3.5 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="font-mono text-xs text-[#111111] font-semibold">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Write your request details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="pure-white-input w-full px-3.5 py-2 text-sm resize-none"
                ></textarea>
              </div>

              {submitSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-mono rounded">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Your message was sent successfully! I will reply as soon as possible.</span>
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-mono rounded">
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="font-mono text-xs px-6 py-3 bg-[#111111] text-[#ffffff] hover:bg-[#2563eb] transition-colors rounded-md cursor-pointer disabled:opacity-50 font-semibold"
                id="submit-contact-btn"
              >
                {submitting ? "Sending..." : "Send Message ↗"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ------------------ PROJECT DETAIL MODAL ------------------ */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-lg max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-[#666666] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs text-[#2563eb] font-semibold">Case Study</span>
              <h3 className="text-2xl font-bold text-[#111111]">{selectedProject.name}</h3>
            </div>

            {selectedProject.imageUrl && (
              <div className="border border-[#e5e5e5] rounded overflow-hidden">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.name}
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}

            <p className="text-sm text-[#666666] leading-relaxed font-sans whitespace-pre-line">
              {selectedProject.description || selectedProject.summary}
            </p>

            <div className="font-mono text-xs text-[#666666] space-y-1.5 border-t border-[#e5e5e5] pt-4">
              <div className="text-[#111111] font-bold">Technologies:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies.map((t) => (
                  <span key={t} className="tech-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 font-mono text-xs">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563eb] hover:underline flex items-center gap-1 font-semibold"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>View Repository ↗</span>
                </a>
              )}
              {selectedProject.demoUrl && (
                <a
                  href={selectedProject.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#111111] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Demo ↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
