'use client';

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

export default function SkillsSection() {
  return (
    <section id="skills" className="space-y-8">
      <div className="space-y-1">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-accent">
          Expertise
        </span>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
          Technical Skillsets
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            className={`bento-cell p-6 space-y-4 relative overflow-hidden ${cat.featured ? 'md:col-span-2' : ''}`}
          >
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
          </div>
        ))}
      </div>
    </section>
  );
}
