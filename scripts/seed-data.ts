import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
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
  // Profile
  {
    PK: "PROFILE",
    SK: "PROFILE",
    name: "Alex Mercer",
    headline: "Senior Cloud & Serverless Architect",
    bio: "I am a Senior Full-Stack Developer and AWS Serverless Architect with over 8 years of experience designing cloud-native solutions. I specialize in building event-driven microservices, developing high-performance web applications using React, and automate architectures with AWS SAM, CloudFormation, and CI/CD pipelines.\n\nMy core design philosophy revolves around high performance, cost optimization, and strict security compliance under the AWS Well-Architected Framework.",
    email: "alex.mercer@example.com",
    githubUrl: "https://github.com/alex-mercer",
    linkedinUrl: "https://linkedin.com/in/alex-mercer",
    avatarUrl: "/content/images/profile/avatar.webp",
  },
  // Skills
  {
    PK: "SKILL",
    SK: "SKILL#aws",
    skillId: "aws",
    name: "Amazon Web Services (AWS)",
    category: "Cloud/DevOps",
    level: 95,
    displayOrder: 1,
  },
  {
    PK: "SKILL",
    SK: "SKILL#serverless",
    skillId: "serverless",
    name: "Serverless (Lambda, API GW, DynamoDB)",
    category: "Cloud/DevOps",
    level: 92,
    displayOrder: 2,
  },
  {
    PK: "SKILL",
    SK: "SKILL#react",
    skillId: "react",
    name: "React, Vite & TypeScript",
    category: "Frontend",
    level: 88,
    displayOrder: 3,
  },
  {
    PK: "SKILL",
    SK: "SKILL#cicd",
    skillId: "cicd",
    name: "CI/CD & Infrastructure as Code (SAM, Terraform)",
    category: "Cloud/DevOps",
    level: 90,
    displayOrder: 4,
  },
  // Experiences
  {
    PK: "EXPERIENCE",
    SK: "EXPERIENCE#2024-01#exp-1",
    experienceId: "exp-1",
    company: "CloudTech Solutions",
    position: "Lead Serverless Architect",
    startDate: "2024-01",
    endDate: null,
    description: "Lead architect designing multi-region serverless applications on AWS.\nMigrated legacy containerized workloads to AWS Lambda, resulting in a 40% reduction in hosting costs.\nStandardized infrastructure deployments using AWS SAM pipelines.",
    displayOrder: 1,
  },
  {
    PK: "EXPERIENCE",
    SK: "EXPERIENCE#2021-06#exp-2",
    experienceId: "exp-2",
    company: "TechVibe Systems",
    position: "Senior Full-Stack Engineer",
    startDate: "2021-06",
    endDate: "2023-12",
    description: "Developed and optimized SaaS applications using React, Node.js, and DynamoDB.\nBuilt secure REST and WebSocket APIs using AWS API Gateway.\nImplemented fine-grained access control using AWS Cognito User Pools.",
    displayOrder: 2,
  },
  // Education
  {
    PK: "EDUCATION",
    SK: "EDUCATION#edu-1",
    educationId: "edu-1",
    school: "Global Tech University",
    major: "B.S. in Computer Science & Engineering",
    startDate: "2016-09",
    endDate: "2020-06",
    description: "Graduated with Honors. Specialized in Distributed Systems and Cloud Computing.",
  },
  {
    PK: "EDUCATION",
    SK: "EDUCATION#edu-2",
    educationId: "edu-2",
    school: "AWS Academy",
    major: "AWS Certified Solutions Architect – Professional",
    startDate: "2021-01",
    endDate: "2021-03",
    description: "In-depth certification validate expertise in designing highly scalable, resilient, and secure systems on AWS.",
  },
  // Projects
  {
    PK: "PROJECT",
    SK: "PROJECT#proj-1",
    projectId: "proj-1",
    name: "Serverless Portfolio Architecture",
    slug: "serverless-portfolio",
    summary: "Complete open-source personal portfolio built with React, Vite, Tailwind, AWS SAM, Cognito, and CloudFront.",
    description: "This portfolio website is designed as a template for modern developers. It uses AWS SAM for infrastructure-as-code, Lambda proxies for CRUD endpoints, Cognito for dashboard security, S3 Content bucket for raw markdown loading, and CloudFront as a CDN.",
    technologies: ["AWS SAM", "AWS Lambda", "API Gateway", "DynamoDB", "Cognito", "React", "Vite", "Tailwind CSS"],
    githubUrl: "https://github.com/alex-mercer/serverless-portfolio",
    demoUrl: "https://example.com/portfolio",
    imageUrl: "/content/images/projects/portfolio-arch.webp",
    displayOrder: 1,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    PK: "PROJECT",
    SK: "PROJECT#proj-2",
    projectId: "proj-2",
    name: "Real-time Telemetry Service",
    slug: "realtime-telemetry",
    summary: "Serverless telemetry dashboard processing IoT metrics in real-time using AWS AppSync and Lambda.",
    description: "An end-to-end serverless telemetry ingestion dashboard. It processes millions of metrics per day, uses Amazon Timestream for storage, and streams live chart animations using AWS AppSync WebSockets to a React client.",
    technologies: ["AWS AppSync", "AWS Lambda", "Kinesis Firehose", "Amazon Timestream", "React", "Tailwind CSS"],
    githubUrl: "https://github.com/alex-mercer/iot-telemetry",
    demoUrl: "https://example.com/telemetry",
    imageUrl: "/content/images/projects/telemetry-system.webp",
    displayOrder: 2,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    PK: "PROJECT",
    SK: "PROJECT#proj-3",
    projectId: "proj-3",
    name: "Microservices Auth Gateway",
    slug: "auth-gateway",
    summary: "Centralized JWT validation service for containerized APIs using CloudFront and Cognito Custom Triggers.",
    description: "Designed a centralized authentication and rate-limiting gateway. Implemented using AWS Cognito, Lambda@Edge for request inspection, and CloudFront forwarding rules, ensuring low-latency authentication for sub-APIs.",
    technologies: ["AWS Lambda@Edge", "Cognito", "CloudFront", "WAF v2", "Node.js"],
    githubUrl: "https://github.com/alex-mercer/auth-gateway",
    demoUrl: "",
    imageUrl: "/content/images/projects/auth-gateway.webp",
    displayOrder: 3,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
