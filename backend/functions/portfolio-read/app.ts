import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getItem, queryItems } from "../../shared/dynamodb.js";
import { successResponse, errorResponse } from "../../shared/response.js";
import { Profile, Project, Skill, Experience, Education } from "../../shared/types.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    // Warmup ping handler
    if ((event as any).source === "serverless-portfolio-warmup") {
      console.log("Warmup ping received. Keeping container warm.");
      return { statusCode: 200, body: "warmed" } as any;
    }

    const path = event.rawPath;
    const method = event.requestContext.http.method;

    console.log(`Received request: ${method} ${path}`);

    if (method !== "GET") {
      return errorResponse(405, "METHOD_NOT_ALLOWED", `Method ${method} not allowed on this endpoint`);
    }

    // GET /api/profile
    if (path === "/api/profile") {
      const profile = await getItem<Profile>("PROFILE", "PROFILE");
      if (!profile) {
        return errorResponse(404, "NOT_FOUND", "Profile information not found");
      }
      return successResponse(profile);
    }

    // GET /api/projects/{id}
    if (path.startsWith("/api/projects/") && event.pathParameters?.id) {
      const id = event.pathParameters.id;
      const project = await getItem<Project>("PROJECT", `PROJECT#${id}`);
      if (!project || !project.published) {
        return errorResponse(404, "NOT_FOUND", `Project with id ${id} not found`);
      }
      return successResponse(project);
    }

    // GET /api/projects
    if (path === "/api/projects") {
      const projects = await queryItems<Project>("PROJECT");
      // Filter published and sort by displayOrder
      const publishedProjects = projects
        .filter((p) => p.published)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return successResponse(publishedProjects);
    }

    // GET /api/skills
    if (path === "/api/skills") {
      const skills = await queryItems<Skill>("SKILL");
      const sortedSkills = skills.sort((a, b) => a.displayOrder - b.displayOrder);
      return successResponse(sortedSkills);
    }

    // GET /api/experiences
    if (path === "/api/experiences") {
      const experiences = await queryItems<Experience>("EXPERIENCE");
      const sortedExperiences = experiences.sort((a, b) => a.displayOrder - b.displayOrder);
      return successResponse(sortedExperiences);
    }

    // GET /api/education
    if (path === "/api/education") {
      const education = await queryItems<Education>("EDUCATION");
      // Education records typically sorted by dates (e.g. end date descending)
      const sortedEducation = education.sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
      return successResponse(sortedEducation);
    }

    return errorResponse(404, "NOT_FOUND", `Requested route ${path} not found`);
  } catch (error: any) {
    console.error("Error occurred in PortfolioReadFunction:", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
  }
}
