import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { rebuildBlogIndex } from "../backend/shared/s3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const region = process.env.AWS_REGION || "ap-southeast-1";
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
  "handson",
  "images",
  "images/profile",
  "images/projects",
  "images/blogs",
];

// Ensure directories exist locally and sync all files from localContentDir to frontendContentDir
for (const dir of directories) {
  fs.mkdirSync(path.join(localContentDir, dir), { recursive: true });
  fs.mkdirSync(path.join(frontendContentDir, dir), { recursive: true });
}

// Helper to copy local content to frontend public folder for Vite dev mode
function syncLocalContentToFrontend(dir: string) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const srcPath = path.join(dir, item);
    const relPath = path.relative(localContentDir, srcPath);
    const destPath = path.join(frontendContentDir, relPath);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      syncLocalContentToFrontend(srcPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}


// 1. Dynamic Blogs Content Loader & Converter
const blogsDir = path.join(localContentDir, "blogs");
const blogItems: any[] = [];

if (fs.existsSync(blogsDir)) {
  // First, convert any standalone .md files that don't have matching .json
  const files = fs.readdirSync(blogsDir);
  for (const file of files) {
    if (file.endsWith(".md")) {
      const slug = file.replace(/\.md$/, "");
      const jsonPath = path.join(blogsDir, `${slug}.json`);
      const mdPath = path.join(blogsDir, file);
      const mdContent = fs.readFileSync(mdPath, "utf-8");

      let title = slug.replace(/-/g, " ");
      const titleMatch = mdContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }

      if (!fs.existsSync(jsonPath)) {
        const newBlogObj = {
          slug,
          title,
          summary: mdContent.split("\n\n")[1] || title,
          coverImage: `/content/images/blogs/placeholder.webp`,
          tags: ["AWS", "DevOps"],
          published: true,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: mdContent,
        };
        fs.writeFileSync(jsonPath, JSON.stringify(newBlogObj, null, 2), "utf-8");
        console.log(`Auto-generated JSON metadata for new blog markdown file: ${slug}.json`);
      }
    }
  }

  // Now load all .json files under content/blogs
  const jsonFiles = fs.readdirSync(blogsDir);
  for (const filename of jsonFiles) {
    if (filename === "index.json" || !filename.endsWith(".json")) continue;
    const filePath = path.join(blogsDir, filename);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      const slug = data.slug || filename.replace(/\.json$/, "");

      // If a matching .md file exists, keep content in sync
      const mdPath = path.join(blogsDir, `${slug}.md`);
      let content = data.content || "";
      if (fs.existsSync(mdPath)) {
        content = fs.readFileSync(mdPath, "utf-8");
      }

      const blogObj = {
        slug,
        title: data.title || slug,
        summary: data.summary || "",
        coverImage: data.coverImage || "/content/images/blogs/placeholder.webp",
        tags: data.tags || [],
        published: data.published !== false,
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        content,
      };

      // Write updated JSON back to ensure consistency
      fs.writeFileSync(filePath, JSON.stringify(blogObj, null, 2), "utf-8");
      blogItems.push(blogObj);
    } catch (e) {
      console.warn(`Could not parse JSON blog ${filename}:`, e);
    }
  }
}

// Generate Blog index.json locally from dynamically scanned blogs
const blogIndex = blogItems.map((b) => ({
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

// Copy all files in local content directory to frontend public content directory
syncLocalContentToFrontend(localContentDir);
console.log("Local static assets generated and synced to frontend/public successfully!");

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
      : relativePath.endsWith(".md")
      ? "text/markdown; charset=utf-8"
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
