<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

// Connection to external Azure SQL Edge database
$host = '100.112.150.56';
$db   = 'portfolio';
$user = 'sa';
$pass = 'Abcd1234@';
$port = '1433';

// DSN for MS SQL Server / Azure SQL Edge using FreeTDS (dblib)
$dsn = "dblib:host=$host:$port;dbname=$db";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

$action = $_GET['action'] ?? 'blogs';

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    if ($action === 'projects') {
        $stmt = $pdo->query('
            SELECT 
                p.id, p.project_number, p.title, p.summary, p.github_url, p.tech_stack,
                pd.id as detail_id, pd.icon, pd.detail_title, pd.detail_description 
            FROM projects p 
            LEFT JOIN project_details pd ON p.id = pd.project_id 
            ORDER BY p.id ASC, pd.id ASC
        ');
        
        $projects = [];
        while ($row = $stmt->fetch()) {
            $projectId = $row['id'];
            if (!isset($projects[$projectId])) {
                $techStack = $row['tech_stack'] ?? '';
                $projects[$projectId] = [
                    "id" => $projectId,
                    "project_number" => $row['project_number'] ?? '',
                    "title" => $row['title'] ?? '',
                    "summary" => $row['summary'] ?? '',
                    "github_url" => $row['github_url'] ?? '#',
                    "tech_stack" => array_values(array_filter(array_map('trim', explode(',', (string) $techStack)))),
                    "details" => []
                ];
            }
            if (!empty($row['detail_id'])) {
                $projects[$projectId]['details'][] = [
                    "icon" => $row['icon'] ?? 'fa-solid fa-circle-info',
                    "detail_title" => $row['detail_title'] ?? '',
                    "detail_description" => $row['detail_description'] ?? ''
                ];
            }
        }
        $projects = array_values($projects);
        echo json_encode(["status" => "success", "data" => $projects]);
    } else {
        $stmt = $pdo->query('SELECT id, title, summary, content, image_url, created_at FROM blogs ORDER BY id DESC');
        
        $blogs = [];
        while ($row = $stmt->fetch()) {
            // Safe date parsing and formatting in PHP
            if (isset($row['created_at']) && !empty($row['created_at'])) {
                try {
                    $dateObj = new DateTime($row['created_at']);
                    $row['date'] = $dateObj->format('F d, Y');
                } catch (Exception $e) {
                    $row['date'] = date('F d, Y');
                }
            } else {
                $row['date'] = date('F d, Y');
            }
            
            // Remove raw created_at to keep response clean
            unset($row['created_at']);
            $blogs[] = $row;
        }
        
        echo json_encode(["status" => "success", "data" => $blogs]);
    }
} catch (\Throwable $e) {
    if ($action === 'projects') {
        $mockProjects = [
            [
                "id" => 1,
                "project_number" => "PROJECT 01",
                "title" => "Hospital Platform CI/CD, GitOps, Kubernetes & Auto Scaling",
                "summary" => "A full-stack hospital management platform deployed through an automated DevOps pipeline featuring dynamic metric-driven infrastructure scaling.",
                "github_url" => "https://github.com/Kien-devops/cicd-ecr-kube-ec2-gitaction.git",
                "tech_stack" => ["AWS EC2", "Kubernetes", "HAProxy", "Traefik API", "Terraform", "Ansible", "Argo CD", "Prometheus"],
                "details" => [
                    [
                        "icon" => "fa-solid fa-route",
                        "detail_title" => "Traffic Routing",
                        "detail_description" => "Internet requests navigate through an external HAProxy Edge Load Balancer, forwarding into a Kubernetes Traefik Gateway API, exposing isolated Frontend and Backend service endpoints."
                    ],
                    [
                        "icon" => "fa-solid fa-server",
                        "detail_title" => "Application Stack",
                        "detail_description" => "Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database."
                    ],
                    [
                        "icon" => "fa-solid fa-shield",
                        "detail_title" => "IaC & Bootstrapping",
                        "detail_description" => "Terraform provisions AWS EC2 instances dynamically. Custom Ansible Playbooks configure dependencies, kernel parameters, and boot them into a private Kubernetes cluster."
                    ],
                    [
                        "icon" => "fa-solid fa-gears",
                        "detail_title" => "Metric-driven Autoscaling",
                        "detail_description" => "Prometheus watches system load. On threshold breaches, Alertmanager sends webhook alerts to a Python scaling daemon, which dynamically provisions and joins new worker nodes via Terraform & Ansible."
                    ]
                ]
            ],
            [
                "id" => 2,
                "project_number" => "PROJECT 02",
                "title" => "Hospital EKS DevSecOps GitOps Platform",
                "summary" => "An end-to-end cloud platform demonstrating EKS cluster hardening, multi-gate security scanning, and declarative zero-drift deployments.",
                "github_url" => "https://github.com/Kien-devops/eks-cicd-argocd-sec-monitor.git",
                "tech_stack" => ["AWS EKS", "Argo CD", "SonarQube", "Trivy", "Kyverno", "Falco", "Loki / Promtail", "Terraform"],
                "details" => [
                    [
                        "icon" => "fa-solid fa-shield-halved",
                        "detail_title" => "DevSecOps Pipeline",
                        "detail_description" => "Multi-stage GitHub Actions workflows enforce SonarQube quality gates, audit dependencies using Nexus, scan container layers via Trivy, and push to Amazon ECR."
                    ],
                    [
                        "icon" => "fa-brands fa-aws",
                        "detail_title" => "EKS Infrastructure",
                        "detail_description" => "Configured using modular Terraform modules. Implements IAM Roles for Service Accounts (IRSA/OIDC) for fine-grained pod access control and KMS-encrypted secrets."
                    ],
                    [
                        "icon" => "fa-solid fa-lock",
                        "detail_title" => "Cluster Security Policies",
                        "detail_description" => "Active runtime security audits using Falco. Custom Kyverno policies enforce non-root container constraints and block privilege escalation paths."
                    ],
                    [
                        "icon" => "fa-solid fa-chart-line",
                        "detail_title" => "Centralized Observability",
                        "detail_description" => "Real-time cluster state dashboarding. Centralized log shipping via Promtail into Loki, queried within Grafana, paired with custom Alertmanager triggers."
                    ]
                ]
            ],
            [
                "id" => 3,
                "project_number" => "PROJECT 03",
                "title" => "Hospital On-Premise DevSecOps GitOps Platform",
                "summary" => "An end-to-end self-hosted on-premise Kubernetes platform demonstrating multi-layer security scanning, dependency caching, GitOps continuous delivery, and full-stack observability.",
                "github_url" => "https://github.com/Kien-devops/k8s-home.git",
                "tech_stack" => ["Kubernetes (On-Premise)", "Argo CD", "Nexus Repository", "SonarQube", "Trivy", "Tailscale", "Kyverno", "Falco", "Loki / Promtail", "HAProxy / Traefik"],
                "details" => [
                    [
                        "icon" => "fa-solid fa-server",
                        "detail_title" => "Application Stack",
                        "detail_description" => "Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database, integrated with a node-local standalone Redis DaemonSet for caching."
                    ],
                    [
                        "icon" => "fa-solid fa-shield-halved",
                        "detail_title" => "DevSecOps Pipeline",
                        "detail_description" => "Multi-stage GitHub Actions workflows restore dependencies through cached NuGet/npm groups in a local Nexus Repository, enforce SonarQube quality gates, perform Trivy filesystem scans, and archive build artifacts."
                    ],
                    [
                        "icon" => "fa-solid fa-shield",
                        "detail_title" => "Supply Chain Security",
                        "detail_description" => "A remote build host connected via a secure Tailscale VPN SSH link downloads the ZIP artifacts from Nexus, builds non-root alpine-based Docker images, performs Trivy image security scans (failing on HIGH or CRITICAL alerts), and pushes them to a local Nexus Docker Registry."
                    ],
                    [
                        "icon" => "fa-solid fa-route",
                        "detail_title" => "GitOps Continuous Delivery",
                        "detail_description" => "The workflow dynamically updates manifest image tags in Git. Argo CD monitors the Git repository as the single source of truth and automates declarative zero-drift sync to the self-hosted Kubernetes cluster."
                    ],
                    [
                        "icon" => "fa-solid fa-lock",
                        "detail_title" => "Cluster Hardening & Security Policies",
                        "detail_description" => "Enforces Kyverno policy baselines at the admission stage, tracks cluster-wide vulnerabilities via Trivy Operator reports, and implements Falco for real-time runtime security anomaly detection."
                    ],
                    [
                        "icon" => "fa-solid fa-chart-line",
                        "detail_title" => "Observability & Logging",
                        "detail_description" => "Centralized log collection is handled via Promtail shipping logs to Loki, while cluster-wide metrics are gathered by Prometheus Operator, and Alertmanager handles alert notifications, all queried and visualized on custom Grafana dashboards."
                    ]
                ]
            ]
        ];
        echo json_encode([
            "status" => "fallback",
            "message" => "Azure SQL Edge connection failed. Serving fallback data. Error: " . $e->getMessage(),
            "data" => $mockProjects
        ]);
    } else {
        // Fallback Mock Data in case the database is not seeded or connection fails
        $mockBlogs = [
            [
                "id" => 1,
                "title" => "Zero-Downtime EKS Upgrades with Blue-Green Node Pools (Offline Mode)",
                "summary" => "How we upgrade production AWS EKS clusters without interrupting running microservices by using cordoning, draining, and blue-green node groups.",
                "content" => "Upgrading an Amazon EKS cluster requires careful coordination to prevent downtime. In this blog post, we walk through the steps of deploying a new 'Green' node group running the target Kubernetes version, cordoning the old 'Blue' node group, and gracefully draining existing pods. We also cover how Pod Disruption Budgets (PDBs) and cluster autoscaler settings play a crucial role in maintaining high availability during the migration.",
                "image_url" => "fa-solid fa-circle-nodes",
                "date" => date("F d, Y")
            ],
            [
                "id" => 2,
                "title" => "Kyverno Policies: Hardening EKS Cluster Security Gates (Offline Mode)",
                "summary" => "A deep dive into enforcing security guardrails in Kubernetes, blocking privilege escalations, and forcing non-root container runtimes using Kyverno.",
                "content" => "Kubernetes security shouldn't be reactive. By shifting security left and using Kyverno, we can enforce strict policies directly at the API admission controller level. This post covers the exact Kyverno policies we use to: 1. Require read-only root filesystems, 2. Block containers running as root users, and 3. Prevent privilege escalation flags. Implement these to achieve immediate compliance with Pod Security Standards (PSS).",
                "image_url" => "fa-solid fa-shield-halved",
                "date" => date("F d, Y")
            ],
            [
                "id" => 3,
                "title" => "Automating ECR Vulnerability Scans & Slack Alerts (Offline Mode)",
                "summary" => "Setting up automated, event-driven image vulnerability scanning in Amazon ECR, using AWS EventBridge and Lambda to send real-time alerts to DevSecOps channels.",
                "content" => "Container security is a continuous process. By configuring Amazon Elastic Container Registry (ECR) to scan-on-push, we ensure every image is checked for CVEs. But how do we act on it? In this post, we set up an AWS EventBridge rule that filters ECR scan results, triggers an AWS Lambda function, and sends structured, color-coded Slack notifications to our team highlighting critical vulnerabilities.",
                "image_url" => "fa-solid fa-triangle-exclamation",
                "date" => date("F d, Y")
            ]
        ];
        echo json_encode([
            "status" => "fallback", 
            "message" => "Azure SQL Edge connection failed. Serving fallback data. Error: " . $e->getMessage(),
            "data" => $mockBlogs
        ]);
    }
}
?>
