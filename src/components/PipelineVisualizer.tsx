'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ShieldAlert, Package, RefreshCw, BarChart2, CheckCircle2, ChevronRight, Terminal, Cpu } from 'lucide-react';

interface Stage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  status: 'success' | 'running' | 'idle';
  color: string;
  details: {
    command: string;
    logs: string[];
    metrics: { label: string; value: string }[];
  };
}

const STAGES: Stage[] = [
  {
    number: 'STAGE 01',
    title: 'Code Commit & CI',
    subtitle: 'GitHub Actions Workflows',
    description: 'Code changes trigger verification workflows. Automated static review checks, branch protections, and basic unit testing validate changes before pipeline progression.',
    icon: GitBranch,
    status: 'success',
    color: 'from-blue-500 to-sky-400',
    details: {
      command: 'git push origin main && gh run watch',
      logs: [
        '✔ trigger: push event detected on main',
        '✔ jobs: lint-code-syntax (0m 45s)',
        '✔ jobs: run-unit-tests (1m 12s)',
        '✔ merge-criteria: branch protection checks passed',
        '✔ workflow: status SUCCESS'
      ],
      metrics: [
        { label: 'Build Time', value: '1m 57s' },
        { label: 'Coverage', value: '94.2%' },
        { label: 'Linter Warnings', value: '0' }
      ]
    }
  },
  {
    number: 'STAGE 02',
    title: 'Security & Quality Gates',
    subtitle: 'SonarQube & Trivy Scan',
    description: 'Deep security inspections. SonarQube runs static analysis to inspect vulnerability patterns, and Trivy audits application packages and container filesystem layers.',
    icon: ShieldAlert,
    status: 'success',
    color: 'from-indigo-500 to-violet-400',
    details: {
      command: 'trivy image --severity HIGH,CRITICAL kien/app:latest',
      logs: [
        '✔ sonar-scanner: project key "kien-portfolio" updated',
        '✔ sonar-quality-gate: PASSED (Bugs: 0, Vulnerabilities: 0)',
        '✔ trivy-scan: analyzing container filesystem...',
        '✔ trivy-scan: 0 High/Critical CVEs identified',
        '✔ security-gate: APPROVED'
      ],
      metrics: [
        { label: 'Bugs', value: '0' },
        { label: 'Sec Hotspots', value: '0' },
        { label: 'CVEs', value: '0' }
      ]
    }
  },
  {
    number: 'STAGE 03',
    title: 'Build & Artifact Cache',
    subtitle: 'Nexus Repository & Amazon ECR',
    description: 'Secure Docker images are built and pushed to AWS Elastic Container Registry (ECR). Package dependencies are stored securely in Sonatype Nexus repository caches.',
    icon: Package,
    status: 'success',
    color: 'from-amber-500 to-yellow-400',
    details: {
      command: 'docker build -t kien/app:db1f4e . && docker push',
      logs: [
        '✔ nexus-cache: verified package-lock.json integrity',
        '✔ docker-build: context loaded, layers resolved',
        '✔ docker-tag: tagging image: ecr/portfolio:db1f4e',
        '✔ aws-ecr: pushing image layers to AWS AP-Southeast-1...',
        '✔ aws-ecr: digest SHA256 matches remote registry'
      ],
      metrics: [
        { label: 'Image Size', value: '82.4 MB' },
        { label: 'Cache Hits', value: '87.5%' },
        { label: 'Registry', value: 'AWS ECR' }
      ]
    }
  },
  {
    number: 'STAGE 04',
    title: 'GitOps Synchronization',
    subtitle: 'Argo CD & Kustomize',
    description: 'Continuous Delivery engine. Argo CD monitors the infrastructure repository, resolving differences between local state configurations and remote EKS environments.',
    icon: RefreshCw,
    status: 'success',
    color: 'from-emerald-500 to-green-400',
    details: {
      command: 'argocd app sync portfolio-prod --prune',
      logs: [
        '✔ argocd: listening to git config changes (SHA: db1f4e)',
        '✔ kustomize: building templates for devsecops cluster',
        '✔ argocd-sync: comparing desired vs live state...',
        '✔ argocd-sync: deploying updated EKS service descriptors',
        '✔ argocd-status: application status: Synced'
      ],
      metrics: [
        { label: 'Sync State', value: 'Healthy' },
        { label: 'Sync Time', value: '14.2s' },
        { label: 'Drifts Fixed', value: '0' }
      ]
    }
  },
  {
    number: 'STAGE 05',
    title: 'EKS Cloud Deployment',
    subtitle: 'Amazon EKS & Observability',
    description: 'Workloads are updated dynamically on EKS Fargate/Managed Node groups. Running containers emit metrics and logs gathered by Prometheus and Grafana dashboards.',
    icon: BarChart2,
    status: 'success',
    color: 'from-rose-500 to-pink-400',
    details: {
      command: 'kubectl get pods -n production -o wide',
      logs: [
        '✔ kubernetes: cluster rollout complete (2 pods online)',
        '✔ ingress-controller: ALB routed successfully',
        '✔ prometheus: scraping metrics endpoint at /metrics',
        '✔ alerts-manager: 0 critical active alerts in workspace',
        '✔ grafana: telemetry dashboards synchronized'
      ],
      metrics: [
        { label: 'Pods Online', value: '2/2' },
        { label: 'CPU Usage', value: '12.4%' },
        { label: 'Response Time', value: '18ms' }
      ]
    }
  }
];

export default function PipelineVisualizer() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const activeStage = STAGES[selectedStageIdx];
  const IconComponent = activeStage.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Stages Navigation List */}
      <div className="lg:col-span-5 space-y-4">
        {STAGES.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isSelected = idx === selectedStageIdx;

          return (
            <motion.button
              key={stage.number}
              onClick={() => setSelectedStageIdx(idx)}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative flex items-start gap-4 ${
                isSelected
                  ? 'bg-card border-accent shadow-[0_0_25px_-5px_rgba(14,165,233,0.15)]'
                  : 'bg-card/40 border-card-border/60 hover:border-card-border hover:bg-card/60'
              }`}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Active Left Indicator Bar */}
              {isSelected && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-accent"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${stage.color} text-white border-transparent`
                    : 'bg-foreground/5 text-text-muted border-card-border/60'
                }`}
              >
                <StageIcon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-accent uppercase">
                    {stage.number}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>PASSED</span>
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground mt-0.5">{stage.title}</h4>
                <p className="text-xs text-text-muted mt-1 font-mono truncate">{stage.subtitle}</p>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 text-text-muted self-center transition-transform ${
                  isSelected ? 'rotate-90 text-accent' : ''
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Stage Detail Terminal Panel */}
      <div className="lg:col-span-7">
        <div className="bg-black/80 border border-card-border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Window Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-foreground/5 border-b border-card-border/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-text-muted ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>pipeline-console.sh</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              {activeStage.number}
            </span>
          </div>

          {/* Window Content */}
          <div className="p-6 space-y-6">
            {/* Description Card */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent" />
                <span>{activeStage.title}</span>
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {activeStage.description}
              </p>
            </div>

            {/* Simulated Command Input */}
            <div className="bg-black/50 border border-card-border/50 rounded-xl p-4 space-y-3 font-mono">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="text-emerald-400">$</span>
                <span className="text-foreground">{activeStage.details.command}</span>
              </div>

              {/* Logs */}
              <div className="space-y-1.5 text-xs text-text-muted pt-2 border-t border-card-border/20 max-h-[160px] overflow-y-auto custom-scrollbar">
                {activeStage.details.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-text-muted select-none">[{index + 1}]</span>
                    <span className={log.startsWith('✔') ? 'text-emerald-400' : 'text-text-muted'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                Pipeline Stage Metrics
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {activeStage.details.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-foreground/5 border border-card-border/50 rounded-xl p-3.5 text-center"
                  >
                    <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <span className="block text-lg font-bold text-foreground mt-1">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
