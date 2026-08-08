import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "ap-southeast-1";
const tableName = process.env.PORTFOLIO_TABLE;

if (!tableName) {
  console.error("PORTFOLIO_TABLE environment variable is required.");
  process.exit(1);
}

console.log(`Seeding table ${tableName} in region ${region}...`);

const ddbClientConfig: any = { region };
if (process.env.AWS_SAM_LOCAL === "true" && process.env.DYNAMODB_ENDPOINT) {
  ddbClientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

const rawClient = new DynamoDBClient(ddbClientConfig);
const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const sampleData = [
  {
    "PK": "PROFILE",
    "SK": "PROFILE",
    "name": "Nguyễn Trung Kiên",
    "headline": "DevOps & Cloud Engineer",
    "bio": "Kỹ sư DevOps & Cloud đam mê xây dựng hạ tầng tự động hoá, đáng tin cậy và bảo mật cao trên nền tảng AWS.\n\nTôi chuyên thiết kế pipeline CI/CD end-to-end, triển khai Kubernetes on-premise theo mô hình GitOps, xây dựng hệ thống serverless event-driven với AWS SAM, và áp dụng DevSecOps vào từng giai đoạn phát triển phần mềm.\n\nNgoài kỹ năng kỹ thuật, tôi luôn hướng tới việc tối ưu hoá chi phí vận hành, tăng tốc độ release và đảm bảo hệ thống hoạt động ổn định theo tiêu chuẩn AWS Well-Architected Framework.",
    "email": "kien07493@gmail.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/180655698?v=4",
    "githubUrl": "https://github.com/Kien-devops",
    "linkedinUrl": "https://linkedin.com/in/trungkien-devops"
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#aws",
    "skillId": "aws",
    "name": "Amazon Web Services",
    "category": "Cloud & DevOps",
    "level": 90,
    "displayOrder": 1
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#kubernetes",
    "skillId": "kubernetes",
    "name": "Kubernetes & Helm",
    "category": "Cloud & DevOps",
    "level": 85,
    "displayOrder": 2
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#serverless",
    "skillId": "serverless",
    "name": "Serverless (Lambda, API GW, DynamoDB)",
    "category": "Cloud/DevOps",
    "level": 92,
    "displayOrder": 3
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#terraform",
    "skillId": "terraform",
    "name": "Terraform & IaC",
    "category": "Cloud & DevOps",
    "level": 88,
    "displayOrder": 4
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#cicd",
    "skillId": "cicd",
    "name": "CI/CD (GitHub Actions, Argo CD)",
    "category": "Cloud & DevOps",
    "level": 90,
    "displayOrder": 5
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#docker",
    "skillId": "docker",
    "name": "Docker & Container",
    "category": "Cloud & DevOps",
    "level": 88,
    "displayOrder": 6
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#devsecops",
    "skillId": "devsecops",
    "name": "DevSecOps (Trivy, SonarQube, Falco, Kyverno)",
    "category": "Security & Observability",
    "level": 80,
    "displayOrder": 7
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#monitoring",
    "skillId": "monitoring",
    "name": "Prometheus, Grafana & Loki",
    "category": "Security & Observability",
    "level": 82,
    "displayOrder": 8
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#gitops",
    "skillId": "gitops",
    "name": "GitOps (Argo CD, Kustomize)",
    "category": "Security & Observability",
    "level": 83,
    "displayOrder": 9
  },
  {
    "PK": "SKILL",
    "SK": "SKILL#linux",
    "skillId": "linux",
    "name": "Linux & Bash Scripting",
    "category": "Infrastructure",
    "level": 85,
    "displayOrder": 10
  },
  {
    "PK": "EXPERIENCE",
    "SK": "EXPERIENCE#2025-03#cert-saa",
    "experienceId": "cert-saa",
    "company": "Amazon Web Services (AWS)",
    "position": "AWS Certified Solutions Architect – Associate",
    "startDate": "2026",
    "endDate": "2029",
    "description": "Đạt chứng chỉ AWS Certified Solutions Architect Associate – chứng nhận năng lực thiết kế kiến trúc hệ thống phân tán, có tính khả dụng cao và bảo mật trên AWS. Bao gồm thiết kế Well-Architected Framework: VPC multi-AZ, Auto Scaling, EKS/ECS, RDS Multi-AZ, CloudFront, Route 53 và IAM Least Privilege.",
    "credlyUrl": "https://www.credly.com/badges/fb64362a-24b4-4006-bc6d-d7fd1428a9e1",
    "displayOrder": 1
  },
  {
    "PK": "EXPERIENCE",
    "SK": "EXPERIENCE#2025-02#cert-dva",
    "experienceId": "cert-dva",
    "company": "Amazon Web Services (AWS)",
    "position": "AWS Certified Developer – Associate",
    "startDate": "2026",
    "endDate": "2029",
    "description": "Đạt chứng chỉ AWS Certified Developer Associate – xác nhận kỹ năng phát triển, deploy và debug ứng dụng cloud-native trên AWS. Kỹ năng bao gồm AWS SDKs/APIs, Lambda, API Gateway, DynamoDB, SQS/SNS, Cognito và AWS SAM framework.",
    "credlyUrl": "https://www.credly.com/badges/e3fdcd6b-e0b5-420e-9dde-993c89617e19",
    "displayOrder": 2
  },
  {
    "PK": "EXPERIENCE",
    "SK": "EXPERIENCE#2025-01#cert-ccp",
    "experienceId": "cert-ccp",
    "company": "Amazon Web Services (AWS)",
    "position": "AWS Certified Cloud Practitioner",
    "startDate": "2026",
    "endDate": "2029",
    "description": "Đạt chứng chỉ AWS Certified Cloud Practitioner – nền tảng hiểu biết toàn diện về dịch vụ đám mây, mô hình định giá, bảo mật và kiến trúc AWS. Xác nhận thành thạo các dịch vụ core: EC2, S3, IAM, VPC, RDS và CloudWatch.",
    "credlyUrl": "https://www.credly.com/badges/74d3175c-1eda-4ee4-ac65-dfb0cc552706",
    "displayOrder": 3
  },
  {
    "PK": "EDUCATION",
    "SK": "EDUCATION#edu-uit",
    "educationId": "edu-uit",
    "school": "Trường Đại học Công nghệ Thông tin – UIT (ĐHQG TP.HCM)",
    "major": "Mạng máy tính và Truyền thông dữ liệu",
    "startDate": "2024",
    "endDate": "2028",
    "description": "Chuyên ngành Mạng máy tính và Truyền thông dữ liệu tại UIT – một trong những trường hàng đầu về CNTT tại Việt Nam.\n\nTập trung vào: Kiến trúc phần mềm, Hệ điều hành, Mạng máy tính, Điện toán đám mây và Phát triển ứng dụng phân tán."
  },
  {
    "PK": "PROJECT",
    "SK": "PROJECT#proj-1",
    "projectId": "proj-1",
    "displayOrder": 1,
    "name": "Hospital On-Premise DevSecOps GitOps Platform",
    "slug": "hospital-devsecops-platform",
    "summary": "Production-grade DevSecOps & GitOps platform cho ứng dụng quản lý bệnh viện: On-premise Kubernetes, Argo CD, SonarQube, Trivy, Kyverno, Falco & full observability stack.",
    "description": "Hệ thống DevSecOps và GitOps hoàn chỉnh cho ứng dụng quản lý bệnh viện (React/Vite frontend + ASP.NET Core 9 backend) triển khai trên Kubernetes on-premise.\n\nPipeline CI/CD qua GitHub Actions (tích hợp qua Tailscale): build → SonarQube quality gate → Trivy filesystem scan → Nexus artifacts → Docker image build → Trivy image scan → deploy GitOps qua Argo CD Root App-of-Apps.\n\nBảo mật cluster & runtime với Kyverno policies, Trivy Operator và Falco detection. Full-stack observability: Prometheus metrics, Grafana dashboards, Alertmanager, Loki logs và Promtail.",
    "technologies": [
      "Kubernetes",
      "Argo CD",
      "GitHub Actions",
      "Kyverno",
      "Falco",
      "Trivy",
      "SonarQube",
      "Prometheus",
      "Grafana",
      "Loki",
      "React",
      "ASP.NET Core",
      "Nexus"
    ],
    "githubUrl": "https://github.com/Kien-devops/k8s-home",
    "imageUrl": "https://raw.githubusercontent.com/Kien-devops/k8s-home/main/k8s-home-full-diagram.png",
    "demoUrl": "",
    "published": true,
    "createdAt": "2026-08-06T13:16:12.186Z",
    "updatedAt": "2026-08-06T13:16:12.186Z"
  },
  {
    "PK": "PROJECT",
    "SK": "PROJECT#proj-2",
    "projectId": "proj-2",
    "displayOrder": 2,
    "name": "Hybrid DevOps E-Commerce AWS Platform",
    "slug": "hybrid-ecommerce-aws-platform",
    "summary": "Hạ tầng E-Commerce hybrid cloud-native trên AWS: ECS Fargate containers, Terraform IaC, AWS SAM serverless (SNS/SQS/Lambda) và GitHub Actions CI/CD.",
    "description": "Hệ thống E-Commerce cloud-native production-ready kết hợp containerized microservices trên AWS ECS Fargate, xử lý sự kiện bất đồng bộ serverless với AWS SAM (SNS, SQS, S3, Node.js Lambdas) và quản lý 100% hạ tầng mạng (VPC, ALB, ECR, ECS) bằng Terraform IaC.\n\nPipeline CI/CD tự động qua 4 GitHub Actions workflows: Terraform infra check, SAM serverless deploy, Express backend container test & Trivy image scan, và React frontend rolling deploy lên ECS Fargate.",
    "technologies": [
      "Terraform",
      "AWS ECS",
      "AWS SAM",
      "AWS Lambda",
      "Docker",
      "GitHub Actions",
      "SNS",
      "SQS",
      "Express.js",
      "React",
      "Trivy"
    ],
    "githubUrl": "https://github.com/Kien-devops/sam-iac-project",
    "imageUrl": "https://raw.githubusercontent.com/Kien-devops/sam-iac-project/main/docs/project_architecture_diagram.png",
    "demoUrl": "",
    "published": true,
    "createdAt": "2026-08-06T13:16:12.186Z",
    "updatedAt": "2026-08-06T13:16:12.186Z"
  },
  {
    "PK": "PROJECT",
    "SK": "PROJECT#proj-3",
    "projectId": "proj-3",
    "displayOrder": 3,
    "name": "AWS Serverless Portfolio Website",
    "slug": "aws-serverless-portfolio",
    "summary": "100% Serverless Developer Portfolio & Platform trên AWS: React, TypeScript, Tailwind v4, AWS SAM, Lambda, API Gateway HTTP API, DynamoDB, Cognito & CloudFront OAC.",
    "description": "Hệ thống Developer Portfolio serverless chuẩn AWS Well-Architected Framework: React 18 frontend + Node.js 20 Lambda backend được quản lý bằng AWS SAM (IaC).\n\nTối ưu hoá hiệu năng & chi phí ($0/tháng): CloudFront CDN với Origin Access Control (OAC), DynamoDB PAY_PER_REQUEST, Cognito User Pool bảo mật Admin JWT, EventBridge warm-start chống cold start, cùng hệ thống quản lý Blog và Hands-on Labs.",
    "technologies": [
      "AWS SAM",
      "AWS Lambda",
      "API Gateway",
      "DynamoDB",
      "Cognito",
      "CloudFront",
      "S3",
      "React",
      "TypeScript",
      "Tailwind CSS"
    ],
    "githubUrl": "https://github.com/Kien-devops/portfolio",
    "imageUrl": "https://raw.githubusercontent.com/Kien-devops/portfolio/main/model.png",
    "demoUrl": "https://www.kiendev.site",
    "published": true,
    "createdAt": "2026-08-08T12:27:00.000Z",
    "updatedAt": "2026-08-08T12:27:00.000Z"
  },
  {
    "PK": "BLOG",
    "SK": "BLOG#aws-serverless-architecture",
    "slug": "aws-serverless-architecture",
    "title": "Phân tích chuyên sâu về Kiến trúc AWS Serverless",
    "summary": "Tìm hiểu cách xây dựng ứng dụng và API backend hiệu năng cao, tối ưu chi phí với AWS Lambda, API Gateway và DynamoDB.",
    "coverImage": "/content/images/blogs/serverless-architecture.webp",
    "tags": ["AWS", "Serverless", "Architecture"],
    "published": true,
    "publishedAt": "2026-08-03T07:56:46.287Z",
    "updatedAt": "2026-08-08T07:56:46.287Z"
  },
  {
    "PK": "BLOG",
    "SK": "BLOG#kubernetes-vs-serverless",
    "slug": "kubernetes-vs-serverless",
    "title": "Kubernetes vs. Serverless: Lựa chọn con đường Cloud phù hợp",
    "summary": "So sánh khách quan giữa EKS container và AWS Lambda cho hệ thống microservices hiện đại.",
    "coverImage": "/content/images/blogs/kubernetes-deployment.webp",
    "tags": ["Kubernetes", "Serverless", "Comparison"],
    "published": true,
    "publishedAt": "2026-07-29T07:56:46.287Z",
    "updatedAt": "2026-08-08T07:56:46.287Z"
  },
  {
    "PK": "BLOG",
    "SK": "BLOG#dynamodb-single-table-design",
    "slug": "dynamodb-single-table-design",
    "title": "Sức mạnh của DynamoDB Single-Table Design",
    "summary": "Phương pháp thiết kế và mô hình hóa cấu trúc dữ liệu quan hệ phức tạp trên một bảng DynamoDB NoSQL duy nhất.",
    "coverImage": "/content/images/blogs/dynamodb-modeling.webp",
    "tags": ["DynamoDB", "NoSQL", "Database Design"],
    "published": true,
    "publishedAt": "2026-07-24T07:56:46.287Z",
    "updatedAt": "2026-08-08T07:56:46.287Z"
  }
];

async function run() {
  for (const item of sampleData) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
        })
      );
      console.log(`Successfully seeded: ${item.PK} - ${item.SK}`);
    } catch (err) {
      console.error(`Failed to seed: ${item.PK} - ${item.SK}`, err);
    }
  }
  console.log("Seeding complete!");
}

run();
