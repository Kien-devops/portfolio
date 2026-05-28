USE portfolio;
GO

-- Create blogs table in Azure SQL Edge / MS SQL Server
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='blogs' AND xtype='U')
BEGIN
    CREATE TABLE blogs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        summary NVARCHAR(MAX) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        image_url NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

-- Seed with DevOps-focused blog posts
-- Clear existing data if re-running
TRUNCATE TABLE blogs;

INSERT INTO blogs (title, summary, content, image_url) VALUES
(
    N'Zero-Downtime EKS Upgrades with Blue-Green Node Pools',
    N'How we upgrade production AWS EKS clusters without interrupting running microservices by using cordoning, draining, and blue-green node groups.',
    N'Upgrading an Amazon EKS cluster requires careful coordination to prevent downtime. In this blog post, we walk through the steps of deploying a new "Green" node group running the target Kubernetes version, cordoning the old "Blue" node group, and gracefully draining existing pods. We also cover how Pod Disruption Budgets (PDBs) and cluster autoscaler settings play a crucial role in maintaining high availability during the migration.',
    N'fa-solid fa-circle-nodes'
),
(
    N'Kyverno Policies: Hardening EKS Cluster Security Gates',
    N'A deep dive into enforcing security guardrails in Kubernetes, blocking privilege escalations, and forcing non-root container runtimes using Kyverno.',
    N'Kubernetes security shouldn''t be reactive. By shifting security left and using Kyverno, we can enforce strict policies directly at the API admission controller level. This post covers the exact Kyverno policies we use to: 1. Require read-only root filesystems, 2. Block containers running as root users, and 3. Prevent privilege escalation flags. Implement these to achieve immediate compliance with Pod Security Standards (PSS).',
    N'fa-solid fa-shield-halved'
),
(
    N'Automating ECR Vulnerability Scans & Slack Alerts',
    N'Setting up automated, event-driven image vulnerability scanning in Amazon ECR, using AWS EventBridge and Lambda to send real-time alerts to DevSecOps channels.',
    N'Container security is a continuous process. By configuring Amazon Elastic Container Registry (ECR) to scan-on-push, we ensure every image is checked for CVEs. But how do we act on it? In this post, we set up an AWS EventBridge rule that filters ECR scan results, triggers an AWS Lambda function, and sends structured, color-coded Slack notifications to our team highlighting critical vulnerabilities.',
    N'fa-solid fa-triangle-exclamation'
);

-- Create projects table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='projects' AND xtype='U')
BEGIN
    CREATE TABLE projects (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_number NVARCHAR(50) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        summary NVARCHAR(MAX) NOT NULL,
        github_url NVARCHAR(MAX) NOT NULL,
        tech_stack NVARCHAR(MAX) NOT NULL
    );
END;

-- Create project_details table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='project_details' AND xtype='U')
BEGIN
    CREATE TABLE project_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
        icon NVARCHAR(255) NOT NULL,
        detail_title NVARCHAR(255) NOT NULL,
        detail_description NVARCHAR(MAX) NOT NULL
    );
END;

-- Clear and seed projects
DELETE FROM project_details;
DELETE FROM projects;
DBCC CHECKIDENT ('projects', RESEED, 0);
DBCC CHECKIDENT ('project_details', RESEED, 0);

INSERT INTO projects (project_number, title, summary, github_url, tech_stack) VALUES
('PROJECT 01', N'Hospital Platform CI/CD, GitOps, Kubernetes & Auto Scaling', N'A full-stack hospital management platform deployed through an automated DevOps pipeline featuring dynamic metric-driven infrastructure scaling.', 'https://github.com/Kien-devops/cicd-ecr-kube-ec2-gitaction.git', 'AWS EC2, Kubernetes, HAProxy, Traefik API, Terraform, Ansible, Argo CD, Prometheus'),
('PROJECT 02', N'Hospital EKS DevSecOps GitOps Platform', N'An end-to-end cloud platform demonstrating EKS cluster hardening, multi-gate security scanning, and declarative zero-drift deployments.', 'https://github.com/Kien-devops/eks-cicd-argocd-sec-monitor.git', 'AWS EKS, Argo CD, SonarQube, Trivy, Kyverno, Falco, Loki / Promtail, Terraform'),
('PROJECT 03', N'Hospital On-Premise DevSecOps GitOps Platform', N'An end-to-end self-hosted on-premise Kubernetes platform demonstrating multi-layer security scanning, dependency caching, GitOps continuous delivery, and full-stack observability.', 'https://github.com/Kien-devops/k8s-home.git', 'Kubernetes (On-Premise), Argo CD, Nexus Repository, SonarQube, Trivy, Tailscale, Kyverno, Falco, Loki / Promtail, HAProxy / Traefik');

-- Get project IDs and insert details
INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-route', N'Traffic Routing', N'Internet requests navigate through an external HAProxy Edge Load Balancer, forwarding into a Kubernetes Traefik Gateway API, exposing isolated Frontend and Backend service endpoints.'
FROM projects WHERE project_number = 'PROJECT 01';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-server', N'Application Stack', N'Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database.'
FROM projects WHERE project_number = 'PROJECT 01';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-shield', N'IaC & Bootstrapping', N'Terraform provisions AWS EC2 instances dynamically. Custom Ansible Playbooks configure dependencies, kernel parameters, and boot them into a private Kubernetes cluster.'
FROM projects WHERE project_number = 'PROJECT 01';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-gears', N'Metric-driven Autoscaling', N'Prometheus watches system load. On threshold breaches, Alertmanager sends webhook alerts to a Python scaling daemon, which dynamically provisions and joins new worker nodes via Terraform & Ansible.'
FROM projects WHERE project_number = 'PROJECT 01';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-shield-halved', N'DevSecOps Pipeline', N'Multi-stage GitHub Actions workflows enforce SonarQube quality gates, audit dependencies using Nexus, scan container layers via Trivy, and push to Amazon ECR.'
FROM projects WHERE project_number = 'PROJECT 02';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-brands fa-aws', N'EKS Infrastructure', N'Configured using modular Terraform modules. Implements IAM Roles for Service Accounts (IRSA/OIDC) for fine-grained pod access control and KMS-encrypted secrets.'
FROM projects WHERE project_number = 'PROJECT 02';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-lock', N'Cluster Security Policies', N'Active runtime security audits using Falco. Custom Kyverno policies enforce non-root container constraints and block privilege escalation paths.'
FROM projects WHERE project_number = 'PROJECT 02';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-chart-line', N'Centralized Observability', N'Real-time cluster state dashboarding. Centralized log shipping via Promtail into Loki, queried within Grafana, paired with custom Alertmanager triggers.'
FROM projects WHERE project_number = 'PROJECT 02';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-server', N'Application Stack', N'Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database, integrated with a node-local standalone Redis DaemonSet for caching.'
FROM projects WHERE project_number = 'PROJECT 03';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-shield-halved', N'DevSecOps Pipeline', N'Multi-stage GitHub Actions workflows restore dependencies through cached NuGet/npm groups in a local Nexus Repository, enforce SonarQube quality gates, perform Trivy filesystem scans, and archive build artifacts.'
FROM projects WHERE project_number = 'PROJECT 03';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-shield', N'Supply Chain Security', N'A remote build host connected via a secure Tailscale VPN SSH link downloads the ZIP artifacts from Nexus, builds non-root alpine-based Docker images, performs Trivy image security scans (failing on HIGH or CRITICAL alerts), and pushes them to a local Nexus Docker Registry.'
FROM projects WHERE project_number = 'PROJECT 03';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-route', N'GitOps Continuous Delivery', N'The workflow dynamically updates manifest image tags in Git. Argo CD monitors the Git repository as the single source of truth and automates declarative zero-drift sync to the self-hosted Kubernetes cluster.'
FROM projects WHERE project_number = 'PROJECT 03';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-lock', N'Cluster Hardening & Security Policies', N'Enforces Kyverno policy baselines at the admission stage, tracks cluster-wide vulnerabilities via Trivy Operator reports, and implements Falco for real-time runtime security anomaly detection.'
FROM projects WHERE project_number = 'PROJECT 03';

INSERT INTO project_details (project_id, icon, detail_title, detail_description)
SELECT id, 'fa-solid fa-chart-line', N'Observability & Logging', N'Centralized log collection is handled via Promtail shipping logs to Loki, while cluster-wide metrics are gathered by Prometheus Operator, and Alertmanager handles alert notifications, all queried and visualized on custom Grafana dashboards.'
FROM projects WHERE project_number = 'PROJECT 03';

