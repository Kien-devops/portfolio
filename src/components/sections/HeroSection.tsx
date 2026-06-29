'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

const TERMINAL_LINES = [
  { prompt: '$', cmd: 'kubectl get nodes --all-namespaces', delay: 0 },
  { prompt: '>', cmd: 'NAME        STATUS   ROLES    AGE   VERSION', delay: 0.6, output: true },
  { prompt: '>', cmd: 'eks-node-1  Ready    <none>   47d   v1.29.0', delay: 0.9, output: true },
  { prompt: '$', cmd: 'terraform apply -auto-approve', delay: 1.5 },
  { prompt: '>', cmd: 'Apply complete! 12 added, 0 changed, 0 destroyed.', delay: 2.1, output: true },
  { prompt: '$', cmd: 'argocd app sync production', delay: 2.7 },
  { prompt: '>', cmd: 'SYNCED  Healthy  production/api', delay: 3.2, output: true },
];

function TerminalBlock() {
  const reduce = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (reduce) { setVisibleLines(TERMINAL_LINES.length); return; }
    const timers = TERMINAL_LINES.map((line) => 
      setTimeout(() => setVisibleLines((n) => n + 1), (line.delay + 0.3) * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className="relative rounded-xl border border-card-border bg-black/50 backdrop-blur-md overflow-hidden shadow-2xl">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6 bg-white/3">
        <span className="w-3 h-3 rounded-full bg-red-500/60" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <span className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-[11px] font-mono text-white/30 tracking-wider">devops — zsh</span>
      </div>
      <div className="p-5 space-y-2 font-mono text-[12px] leading-relaxed min-h-[220px]">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className={line.output ? 'text-white/25' : 'text-accent'}>{line.prompt}</span>
            <span className={line.output ? 'text-white/50' : 'text-white/85'}>{line.cmd}</span>
          </div>
        ))}
        {visibleLines >= TERMINAL_LINES.length && <span className="terminal-cursor" />}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section id="about" className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[100dvh] -mt-8 pt-16 md:pt-0">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/8 border border-accent/20 text-accent text-[11px] font-mono tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Available for Consulting
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-foreground">
          Hi, I'm <span className="text-gradient">Kien Nguyen</span>
        </h1>

        <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-[48ch]">
          DevOps &amp; DevSecOps Engineer. Secure EKS clusters, GitOps deployments, shift-left security.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a href="#projects" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-black font-bold text-sm transition-all duration-250 active:scale-[0.98]">
            View Work
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-card-border hover:border-accent/40 text-foreground font-semibold text-sm transition-all duration-250 active:scale-[0.98]">
            <Mail className="w-4 h-4 text-accent" />
            Contact
          </a>
        </div>
      </div>

      <div>
        <TerminalBlock />
      </div>
    </section>
  );
}
