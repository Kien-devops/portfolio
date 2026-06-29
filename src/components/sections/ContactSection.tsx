import { Mail, ExternalLink } from 'lucide-react';

export default function ContactSection() {
  const contactLinks = [
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'Email',
      value: 'kiennguly24@gmail.com',
      href: 'mailto:kiennguly24@gmail.com',
    },
    {
      icon: <span className="text-base"><i className="fa-brands fa-github" /></span>,
      label: 'GitHub',
      value: '@Kien-devops',
      href: 'https://github.com/Kien-devops',
      external: true,
    },
    {
      icon: <span className="text-base"><i className="fa-brands fa-linkedin" /></span>,
      label: 'LinkedIn',
      value: 'Kien Nguyen',
      href: 'https://www.linkedin.com/in/kien-vpc-peering/',
      external: true,
    },
  ];

  return (
    <section id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      <div className="space-y-4">
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
      </div>

      <div className="space-y-3">
        {contactLinks.map((item) => (
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
      </div>
    </section>
  );
}
