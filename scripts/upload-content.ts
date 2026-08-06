import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { rebuildBlogIndex } from "../backend/shared/s3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.CONTENT_BUCKET;

console.log("Setting up local content assets...");

const base64PixelImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imageBuffer = Buffer.from(base64PixelImage, "base64");

// Define content directories
const rootDir = path.join(__dirname, "..");
const localContentDir = path.join(rootDir, "content");
const frontendContentDir = path.join(rootDir, "frontend", "public", "content");

const directories = [
  "blogs",
  "images",
  "images/profile",
  "images/projects",
  "images/blogs",
];

// Ensure directories exist locally
for (const dir of directories) {
  fs.mkdirSync(path.join(localContentDir, dir), { recursive: true });
  fs.mkdirSync(path.join(frontendContentDir, dir), { recursive: true });
}

// 1. Sample Blogs Content
const blogs = [
  {
    slug: "aws-serverless-architecture",
    title: "Deep Dive into AWS Serverless Architecture",
    summary: "Learn how to build high-performance, cost-optimized backend APIs using AWS Lambda, API Gateway, and DynamoDB.",
    coverImage: "/content/images/blogs/serverless-architecture.webp",
    tags: ["AWS", "Serverless", "Architecture"],
    published: true,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
    content: `# Deep Dive into AWS Serverless Architecture

Serverless architecture has revolutionized the way we build and deploy web applications. By eliminating server management, developers can focus entirely on writing business logic.

## Core Pillars of AWS Serverless

In this article, we explore the core building blocks of a serverless application:

1. **Amazon API Gateway**: Serves as the entry point, routing HTTP traffic to backend handlers and enforcing security limits.
2. **AWS Lambda**: The compute plane. Runs functions in response to API requests, scaling horizontally automatically.
3. **Amazon DynamoDB**: A NoSQL database that offers single-digit millisecond latency at any scale.

## Benefits of Serverless

* **Zero Idle Costs**: You only pay for the exact millisecond your function executes.
* **Auto-Scaling**: Seamlessly handles traffic spikes without manual scaling groups.
* **High Availability**: Built-in fault tolerance across multiple Availability Zones.

\`\`\`javascript
// Example Lambda Handler
export async function handler(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello Serverless!" })
  };
}
\`\`\`

## Well-Architected Serverless

Always follow the principle of least privilege in IAM configurations. Make sure each Lambda function only has access to the tables and buckets it absolutely requires.
`,
  },
  {
    slug: "kubernetes-vs-serverless",
    title: "Kubernetes vs. Serverless: Choosing the Right Cloud Path",
    summary: "An objective comparison of EKS containers vs. AWS Lambda for modern microservices.",
    coverImage: "/content/images/blogs/kubernetes-deployment.webp",
    tags: ["Kubernetes", "Serverless", "Comparison"],
    published: true,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date().toISOString(),
    content: `# Kubernetes vs. Serverless: Choosing the Right Cloud Path

Architecting modern platforms requires choosing between container orchestrators (like Kubernetes) and serverless function platforms (like AWS Lambda). Both offer distinct advantages.

## Kubernetes (EKS / GKE)

Kubernetes is ideal for long-running workloads, complex stateful systems, and enterprises requiring cloud-agnostic portability.

### Pros
* Direct control over runtime and container OS.
* Cloud-agnostic (runs on AWS, Azure, GCP, or bare metal).
* Predictable cost model for high, constant utilization.

### Cons
* Operational complexity (requires dedicated platform engineers).
* Higher base infrastructure cost.

## Serverless (AWS Lambda)

Serverless excels for event-driven systems, unpredictable traffic flows, and startups focusing on rapid time-to-market.

### Pros
* Zero server administration.
* Scales from 0 to thousands of concurrent executions in seconds.
* Zero base cost.

### Cons
* Vendor lock-in.
* Cold start latency.
* Limit on execution duration (maximum 15 minutes in Lambda).
`,
  },
  {
    slug: "dynamodb-single-table-design",
    title: "The Magic of DynamoDB Single-Table Design",
    summary: "How to model complex relational structures in a single DynamoDB NoSQL table.",
    coverImage: "/content/images/blogs/dynamodb-modeling.webp",
    tags: ["DynamoDB", "NoSQL", "Database Design"],
    published: true,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 24 * 15).toISOString(), // 15 days ago
    updatedAt: new Date().toISOString(),
    content: `# The Magic of DynamoDB Single-Table Design

Modeling relational data in a NoSQL database requires a shift in mindset. Single-table design is a pattern where all application entities are stored in a single table, using generic primary key names (like \`PK\` and \`SK\`).

## Why Single-Table?

In SQL databases, joining tables is a common operation. However, joins degrade in performance as database size grows. In DynamoDB, we pre-join our data by organizing related entities adjacent to each other. This allows fetching related data in a single \`Query\` operation rather than joining.

## Modeling our Portfolio Table

Our portfolio uses this single table design to store multiple entities:

* **Profile**: \`PK = PROFILE\`, \`SK = PROFILE\`
* **Skill**: \`PK = SKILL\`, \`SK = SKILL#<skillId>\`
* **Projects**: \`PK = PROJECT\`, \`SK = PROJECT#<projectId>\`

Using this structure, we can query all skills by requesting \`PK = SKILL\`, or query a specific project by requesting \`PK = PROJECT\` and \`SK = PROJECT#proj-1\`.

## Rules to Remember

1. **Understand your Access Patterns first**: You cannot design a NoSQL table without knowing all queries first.
2. **Never scan**: Scan operations are expensive and slow. Always design keys to support Query operations.
3. **Use secondary indexes (GSIs)**: If you need to query items by other attributes, use global secondary indexes.
`,
  },
];

// Write Blog JSONs
for (const blog of blogs) {
  const jsonContent = JSON.stringify(blog, null, 2);
  fs.writeFileSync(path.join(localContentDir, "blogs", `${blog.slug}.json`), jsonContent);
  fs.writeFileSync(path.join(frontendContentDir, "blogs", `${blog.slug}.json`), jsonContent);
}

// Generate Blog index.json locally
const blogIndex = blogs.map((b) => ({
  slug: b.slug,
  title: b.title,
  summary: b.summary,
  coverImage: b.coverImage,
  tags: b.tags,
  published: b.published,
  publishedAt: b.publishedAt,
  updatedAt: b.updatedAt,
}));

fs.writeFileSync(path.join(localContentDir, "blogs", "index.json"), JSON.stringify(blogIndex, null, 2));
fs.writeFileSync(path.join(frontendContentDir, "blogs", "index.json"), JSON.stringify(blogIndex, null, 2));

// 2. Generate Placeholders locally
const imagePaths = [
  "images/profile/avatar.webp",
  "images/projects/portfolio-arch.webp",
  "images/projects/telemetry-system.webp",
  "images/projects/auth-gateway.webp",
  "images/projects/placeholder.webp",
  "images/blogs/serverless-architecture.webp",
  "images/blogs/kubernetes-deployment.webp",
  "images/blogs/dynamodb-modeling.webp",
  "images/blogs/placeholder.webp",
];

for (const imgPath of imagePaths) {
  fs.writeFileSync(path.join(localContentDir, imgPath), imageBuffer);
  fs.writeFileSync(path.join(frontendContentDir, imgPath), imageBuffer);
}

console.log("Local static assets generated successfully!");

// 3. Optional S3 Upload
async function uploadToS3() {
  if (!bucketName) {
    console.log("CONTENT_BUCKET is not set. Skipping S3 upload.");
    return;
  }

  console.log(`Uploading content files to S3 bucket '${bucketName}'...`);
  const s3Client = new S3Client({ region });

  const filesToUpload: string[] = [];

  // Helper to recursively list files
  function addFiles(dir: string, s3Prefix = "") {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const s3Key = path.join(s3Prefix, file).replace(/\\/g, "/"); // normalize windows paths
      
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        addFiles(filePath, s3Key);
      } else {
        filesToUpload.push(filePath);
      }
    }
  }

  addFiles(localContentDir);

  for (const filePath of filesToUpload) {
    const relativePath = path.relative(localContentDir, filePath).replace(/\\/g, "/");
    const fileContent = fs.readFileSync(filePath);
    const contentType = relativePath.endsWith(".json")
      ? "application/json"
      : relativePath.endsWith(".webp")
      ? "image/webp"
      : "application/octet-stream";

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: relativePath,
          Body: fileContent,
          ContentType: contentType,
        })
      );
      console.log(`Uploaded to S3: ${relativePath}`);
    } catch (err) {
      console.error(`Failed to upload ${relativePath}:`, err);
    }
  }

  // Trigger S3 index rebuild just in case
  try {
    process.env.CONTENT_BUCKET = bucketName;
    await rebuildBlogIndex();
    console.log("S3 Blog index rebuilt successfully!");
  } catch (err) {
    console.error("Failed to rebuild S3 blog index:", err);
  }
}

uploadToS3();
