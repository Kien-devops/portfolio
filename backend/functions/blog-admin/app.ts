import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { putS3Object, getS3Object, deleteS3Object, rebuildBlogIndex } from "../../shared/s3.js";
import { successResponse, errorResponse } from "../../shared/response.js";
import { validateBlog } from "../../shared/validation.js";
import { BlogContent } from "../../shared/types.js";

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

      // Check if blog already exists to prevent overwrite
      let exists = false;
      try {
        await getS3Object(s3Key);
        exists = true;
      } catch {
        // Doesn't exist, which is what we want
      }

      if (exists) {
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

      await putS3Object(s3Key, JSON.stringify(newBlog, null, 2));
      await rebuildBlogIndex();

      return successResponse(newBlog, 201, "Blog post created successfully");
    }

    // PUT /api/admin/blogs/{slug} (Update blog)
    // DELETE /api/admin/blogs/{slug} (Delete blog)
    if (path.startsWith("/api/admin/blogs/") && pathParams?.slug) {
      const paramSlug = pathParams.slug.toLowerCase().trim();
      const s3Key = `blogs/${paramSlug}.json`;

      // Verify the blog exists
      let existingBlog: BlogContent;
      try {
        const contentStr = await getS3Object(s3Key);
        existingBlog = JSON.parse(contentStr);
      } catch (err) {
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

        // If the slug changes, we must delete the old object and write the new one
        if (newSlug !== paramSlug) {
          // Check if new slug already exists
          let newSlugExists = false;
          try {
            await getS3Object(`blogs/${newSlug}.json`);
            newSlugExists = true;
          } catch {
            // Safe to write
          }
          if (newSlugExists) {
            return errorResponse(409, "ALREADY_EXISTS", `Cannot rename blog. Slug '${newSlug}' already exists`);
          }

          await deleteS3Object(s3Key);
        }

        await putS3Object(`blogs/${newSlug}.json`, JSON.stringify(updatedBlog, null, 2));
        await rebuildBlogIndex();

        return successResponse(updatedBlog, 200, "Blog post updated successfully");
      }

      if (method === "DELETE") {
        await deleteS3Object(s3Key);
        await rebuildBlogIndex();
        return successResponse({ deleted: true }, 200, "Blog post deleted successfully");
      }
    }

    return errorResponse(404, "NOT_FOUND", `Requested route ${method} ${path} not found`);
  } catch (error: any) {
    console.error("Error occurred in BlogAdminFunction:", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
  }
}
