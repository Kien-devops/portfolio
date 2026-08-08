import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { putS3Object, getS3Object, deleteS3Object } from "../../shared/s3.js";
import { getBlogItem, putBlogItem, deleteBlogItem } from "../../shared/dynamodb.js";
import { successResponse, errorResponse } from "../../shared/response.js";
import { validateBlog } from "../../shared/validation.js";
import { BlogContent, BlogMetadata } from "../../shared/types.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const path = event.rawPath;
    const method = event.requestContext.http.method;
    const pathParams = event.pathParameters;

    console.log(`Blog Admin function received: ${method} ${path}`);

    let data: any = {};
    if (method === "POST" || method === "PUT") {
      if (!event.body) {
        return errorResponse(400, "BAD_REQUEST", "Request body is empty");
      }
      try {
        data = JSON.parse(event.body);
      } catch (err) {
        return errorResponse(400, "INVALID_JSON", "Request body is not valid JSON");
      }
    }

    // POST /api/admin/blogs (Create blog)
    if (path === "/api/admin/blogs" && method === "POST") {
      const errors = validateBlog(data);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }

      const slug = data.slug.toLowerCase().trim();
      const s3Key = `blogs/${slug}.json`;

      // Check if blog already exists in DynamoDB or S3
      const existingInDdb = await getBlogItem(slug);
      if (existingInDdb) {
        return errorResponse(409, "ALREADY_EXISTS", `Blog with slug '${slug}' already exists`);
      }

      const now = new Date().toISOString();
      const newBlog: BlogContent = {
        title: data.title.trim(),
        slug,
        summary: data.summary.trim(),
        content: data.content,
        coverImage: data.coverImage.trim(),
        tags: data.tags,
        published: data.published,
        publishedAt: data.published ? now : "",
        updatedAt: now,
      };

      const blogMetadata: BlogMetadata = {
        slug: newBlog.slug,
        title: newBlog.title,
        summary: newBlog.summary,
        coverImage: newBlog.coverImage,
        tags: newBlog.tags,
        published: newBlog.published,
        publishedAt: newBlog.publishedAt,
        updatedAt: newBlog.updatedAt,
      };

      await putS3Object(s3Key, JSON.stringify(newBlog, null, 2));
      await putBlogItem(blogMetadata);

      return successResponse(newBlog, 201, "Blog post created successfully");
    }

    // PUT /api/admin/blogs/{slug} (Update blog)
    // DELETE /api/admin/blogs/{slug} (Delete blog)
    if (path.startsWith("/api/admin/blogs/") && pathParams?.slug) {
      const paramSlug = pathParams.slug.toLowerCase().trim();
      const s3Key = `blogs/${paramSlug}.json`;

      // Verify the blog exists
      let existingBlog: BlogContent | null = null;
      try {
        const contentStr = await getS3Object(s3Key);
        existingBlog = JSON.parse(contentStr);
      } catch (err) {
        const ddbBlog = await getBlogItem<BlogMetadata>(paramSlug);
        if (ddbBlog) {
          existingBlog = { ...ddbBlog, content: "" };
        }
      }

      if (!existingBlog) {
        return errorResponse(404, "NOT_FOUND", `Blog with slug '${paramSlug}' not found`);
      }

      if (method === "PUT") {
        const errors = validateBlog(data);
        if (errors.length > 0) {
          return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
        }

        const newSlug = data.slug.toLowerCase().trim();
        const now = new Date().toISOString();

        // Calculate publishedAt
        let publishedAt = existingBlog.publishedAt;
        if (data.published && !publishedAt) {
          publishedAt = now;
        }

        const updatedBlog: BlogContent = {
          title: data.title.trim(),
          slug: newSlug,
          summary: data.summary.trim(),
          content: data.content,
          coverImage: data.coverImage.trim(),
          tags: data.tags,
          published: data.published,
          publishedAt,
          updatedAt: now,
        };

        const updatedMetadata: BlogMetadata = {
          slug: updatedBlog.slug,
          title: updatedBlog.title,
          summary: updatedBlog.summary,
          coverImage: updatedBlog.coverImage,
          tags: updatedBlog.tags,
          published: updatedBlog.published,
          publishedAt: updatedBlog.publishedAt,
          updatedAt: updatedBlog.updatedAt,
        };

        // If the slug changes, we must delete the old object/item
        if (newSlug !== paramSlug) {
          const newSlugExists = await getBlogItem(newSlug);
          if (newSlugExists) {
            return errorResponse(409, "ALREADY_EXISTS", `Cannot rename blog. Slug '${newSlug}' already exists`);
          }

          await deleteS3Object(s3Key);
          await deleteBlogItem(paramSlug);
        }

        await putS3Object(`blogs/${newSlug}.json`, JSON.stringify(updatedBlog, null, 2));
        await putBlogItem(updatedMetadata);

        return successResponse(updatedBlog, 200, "Blog post updated successfully");
      }

      if (method === "DELETE") {
        try {
          await deleteS3Object(s3Key);
        } catch (e) {
          // ignore if S3 object missing
        }
        await deleteBlogItem(paramSlug);
        return successResponse({ deleted: true }, 200, "Blog post deleted successfully");
      }
    }

    return errorResponse(404, "NOT_FOUND", `Requested route ${method} ${path} not found`);
  } catch (error: any) {
    console.error("Error occurred in BlogAdminFunction:", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
  }
}

