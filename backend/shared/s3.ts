import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { BlogMetadata, BlogContent } from "./types.js";

const region = process.env.AWS_REGION || "ap-southeast-1";
const isLocal = process.env.AWS_SAM_LOCAL === "true" || process.env.NODE_ENV === "test";

const s3ClientConfig: any = { region };

if (isLocal && process.env.S3_ENDPOINT) {
  s3ClientConfig.endpoint = process.env.S3_ENDPOINT;
  s3ClientConfig.forcePathStyle = true;
}

export const s3Client = new S3Client(s3ClientConfig);
export const CONTENT_BUCKET = process.env.CONTENT_BUCKET || "";

export async function putS3Object(
  key: string,
  content: string,
  contentType: string = "application/json"
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: CONTENT_BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
      CacheControl: "public, max-age=0, must-revalidate", // Disable long caching for index and updates
    })
  );
}

export async function getS3Object(key: string): Promise<string> {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: CONTENT_BUCKET,
      Key: key,
    })
  );
  if (!result.Body) {
    throw new Error(`S3 object body is empty for key: ${key}`);
  }
  return await result.Body.transformToString();
}

export async function deleteS3Object(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: CONTENT_BUCKET,
      Key: key,
    })
  );
}

export async function listS3Objects(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: CONTENT_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key) {
          keys.push(item.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

/**
 * Rebuilds the `blogs/index.json` registry file containing metadata of all published blogs.
 */
export async function rebuildBlogIndex(): Promise<void> {
  if (!CONTENT_BUCKET) {
    console.warn("CONTENT_BUCKET environment variable is not defined. Skipping blog index rebuild.");
    return;
  }
  
  const allBlogKeys = await listS3Objects("blogs/");
  const blogList: BlogMetadata[] = [];

  for (const key of allBlogKeys) {
    // Skip the index file itself
    if (key === "blogs/index.json") {
      continue;
    }
    // Only process .json files under blogs/
    if (!key.endsWith(".json")) {
      continue;
    }

    try {
      const contentStr = await getS3Object(key);
      const blog: BlogContent = JSON.parse(contentStr);

      if (blog.published) {
        // Collect only metadata
        const metadata: BlogMetadata = {
          slug: blog.slug,
          title: blog.title,
          summary: blog.summary,
          coverImage: blog.coverImage,
          tags: blog.tags,
          published: blog.published,
          publishedAt: blog.publishedAt,
          updatedAt: blog.updatedAt,
        };
        blogList.push(metadata);
      }
    } catch (err) {
      console.error(`Failed to process blog object with key ${key}:`, err);
    }
  }

  // Sort by publishedAt date descending
  blogList.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Write index.json back to S3
  await putS3Object("blogs/index.json", JSON.stringify(blogList, null, 2));
}
