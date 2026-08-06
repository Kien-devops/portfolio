import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getItem, putItem, queryItems, deleteItem } from "../../shared/dynamodb.js";
import { successResponse, errorResponse } from "../../shared/response.js";
import {
  validateProfile,
  validateProject,
  validateSkill,
  validateExperience,
  validateEducation,
} from "../../shared/validation.js";
import { Profile, Project, Skill, Experience, Education } from "../../shared/types.js";
import { randomUUID } from "crypto";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const path = event.rawPath;
    const method = event.requestContext.http.method;
    const pathParams = event.pathParameters;

    console.log(`Portfolio Admin function received: ${method} ${path}`);

    // Parse body if it is a POST or PUT
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

    // --- 1. PROFILE ENDPOINTS ---
    if (path === "/api/admin/profile" && method === "PUT") {
      const errors = validateProfile(data);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }
      const updatedProfile: Profile = {
        PK: "PROFILE",
        SK: "PROFILE",
        name: data.name.trim(),
        headline: data.headline.trim(),
        bio: data.bio.trim(),
        email: data.email.trim(),
        githubUrl: (data.githubUrl || "").trim(),
        linkedinUrl: (data.linkedinUrl || "").trim(),
        avatarUrl: data.avatarUrl.trim(),
      };
      await putItem(updatedProfile);
      return successResponse(updatedProfile, 200, "Profile updated successfully");
    }

    // --- 2. PROJECTS ENDPOINTS ---
    if (path === "/api/admin/projects" && method === "POST") {
      const projectId = data.projectId || randomUUID();
      const updatedData = { ...data, projectId };
      const errors = validateProject(updatedData);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }
      const newProject: Project = {
        PK: "PROJECT",
        SK: `PROJECT#${projectId}`,
        projectId,
        name: updatedData.name.trim(),
        slug: updatedData.slug.trim(),
        summary: updatedData.summary.trim(),
        description: updatedData.description.trim(),
        technologies: updatedData.technologies,
        githubUrl: (updatedData.githubUrl || "").trim(),
        demoUrl: (updatedData.demoUrl || "").trim(),
        imageUrl: updatedData.imageUrl.trim(),
        displayOrder: updatedData.displayOrder,
        published: updatedData.published,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await putItem(newProject);
      return successResponse(newProject, 201, "Project created successfully");
    }

    if (path.startsWith("/api/admin/projects/") && pathParams?.id) {
      const id = pathParams.id;
      const projectKey = `PROJECT#${id}`;
      
      if (method === "PUT") {
        const existing = await getItem<Project>("PROJECT", projectKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Project with ID ${id} not found`);
        }
        const updatedData = { ...data, projectId: id };
        const errors = validateProject(updatedData);
        if (errors.length > 0) {
          return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
        }
        const updatedProject: Project = {
          ...existing,
          name: updatedData.name.trim(),
          slug: updatedData.slug.trim(),
          summary: updatedData.summary.trim(),
          description: updatedData.description.trim(),
          technologies: updatedData.technologies,
          githubUrl: (updatedData.githubUrl || "").trim(),
          demoUrl: (updatedData.demoUrl || "").trim(),
          imageUrl: updatedData.imageUrl.trim(),
          displayOrder: updatedData.displayOrder,
          published: updatedData.published,
          updatedAt: new Date().toISOString(),
        };
        await putItem(updatedProject);
        return successResponse(updatedProject, 200, "Project updated successfully");
      }

      if (method === "DELETE") {
        const existing = await getItem<Project>("PROJECT", projectKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Project with ID ${id} not found`);
        }
        await deleteItem("PROJECT", projectKey);
        return successResponse({ deleted: true }, 200, "Project deleted successfully");
      }
    }

    // --- 3. SKILLS ENDPOINTS ---
    if (path === "/api/admin/skills" && method === "POST") {
      const skillId = data.skillId || randomUUID();
      const updatedData = { ...data, skillId };
      const errors = validateSkill(updatedData);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }
      const newSkill: Skill = {
        PK: "SKILL",
        SK: `SKILL#${skillId}`,
        skillId,
        name: updatedData.name.trim(),
        category: updatedData.category.trim(),
        level: updatedData.level,
        displayOrder: updatedData.displayOrder,
      };
      await putItem(newSkill);
      return successResponse(newSkill, 201, "Skill created successfully");
    }

    if (path.startsWith("/api/admin/skills/") && pathParams?.id) {
      const id = pathParams.id;
      const skillKey = `SKILL#${id}`;

      if (method === "PUT") {
        const existing = await getItem<Skill>("SKILL", skillKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Skill with ID ${id} not found`);
        }
        const updatedData = { ...data, skillId: id };
        const errors = validateSkill(updatedData);
        if (errors.length > 0) {
          return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
        }
        const updatedSkill: Skill = {
          PK: "SKILL",
          SK: skillKey,
          skillId: id,
          name: updatedData.name.trim(),
          category: updatedData.category.trim(),
          level: updatedData.level,
          displayOrder: updatedData.displayOrder,
        };
        await putItem(updatedSkill);
        return successResponse(updatedSkill, 200, "Skill updated successfully");
      }

      if (method === "DELETE") {
        const existing = await getItem<Skill>("SKILL", skillKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Skill with ID ${id} not found`);
        }
        await deleteItem("SKILL", skillKey);
        return successResponse({ deleted: true }, 200, "Skill deleted successfully");
      }
    }

    // --- 4. EXPERIENCES ENDPOINTS ---
    if (path === "/api/admin/experiences" && method === "POST") {
      const experienceId = data.experienceId || randomUUID();
      const updatedData = { ...data, experienceId };
      const errors = validateExperience(updatedData);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }
      const newExperience: Experience = {
        PK: "EXPERIENCE",
        SK: `EXPERIENCE#${updatedData.startDate}#${experienceId}`,
        experienceId,
        company: updatedData.company.trim(),
        position: updatedData.position.trim(),
        startDate: updatedData.startDate,
        endDate: updatedData.endDate || null,
        description: updatedData.description.trim(),
        displayOrder: updatedData.displayOrder,
      };
      await putItem(newExperience);
      return successResponse(newExperience, 201, "Experience created successfully");
    }

    if (path.startsWith("/api/admin/experiences/") && pathParams?.id) {
      const id = pathParams.id;
      // We must query and find the matching experience by ID since SK contains the start date
      const list = await queryItems<Experience>("EXPERIENCE");
      const existing = list.find((e) => e.experienceId === id);
      if (!existing) {
        return errorResponse(404, "NOT_FOUND", `Experience with ID ${id} not found`);
      }

      if (method === "PUT") {
        const updatedData = { ...data, experienceId: id };
        const errors = validateExperience(updatedData);
        if (errors.length > 0) {
          return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
        }

        // If the startDate has changed, we must delete the old record since the SK changes
        if (existing.startDate !== updatedData.startDate) {
          await deleteItem(existing.PK, existing.SK);
        }

        const updatedExperience: Experience = {
          PK: "EXPERIENCE",
          SK: `EXPERIENCE#${updatedData.startDate}#${id}`,
          experienceId: id,
          company: updatedData.company.trim(),
          position: updatedData.position.trim(),
          startDate: updatedData.startDate,
          endDate: updatedData.endDate || null,
          description: updatedData.description.trim(),
          displayOrder: updatedData.displayOrder,
        };

        await putItem(updatedExperience);
        return successResponse(updatedExperience, 200, "Experience updated successfully");
      }

      if (method === "DELETE") {
        await deleteItem(existing.PK, existing.SK);
        return successResponse({ deleted: true }, 200, "Experience deleted successfully");
      }
    }

    // --- 5. EDUCATION ENDPOINTS ---
    if (path === "/api/admin/education" && method === "POST") {
      const educationId = data.educationId || randomUUID();
      const updatedData = { ...data, educationId };
      const errors = validateEducation(updatedData);
      if (errors.length > 0) {
        return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
      }
      const newEducation: Education = {
        PK: "EDUCATION",
        SK: `EDUCATION#${educationId}`,
        educationId,
        school: updatedData.school.trim(),
        major: updatedData.major.trim(),
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        description: updatedData.description ? updatedData.description.trim() : "",
      };
      await putItem(newEducation);
      return successResponse(newEducation, 201, "Education record created successfully");
    }

    if (path.startsWith("/api/admin/education/") && pathParams?.id) {
      const id = pathParams.id;
      const educationKey = `EDUCATION#${id}`;

      if (method === "PUT") {
        const existing = await getItem<Education>("EDUCATION", educationKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Education record with ID ${id} not found`);
        }
        const updatedData = { ...data, educationId: id };
        const errors = validateEducation(updatedData);
        if (errors.length > 0) {
          return errorResponse(400, "VALIDATION_ERROR", JSON.stringify(errors));
        }
        const updatedEducation: Education = {
          PK: "EDUCATION",
          SK: educationKey,
          educationId: id,
          school: updatedData.school.trim(),
          major: updatedData.major.trim(),
          startDate: updatedData.startDate,
          endDate: updatedData.endDate,
          description: updatedData.description ? updatedData.description.trim() : "",
        };
        await putItem(updatedEducation);
        return successResponse(updatedEducation, 200, "Education record updated successfully");
      }

      if (method === "DELETE") {
        const existing = await getItem<Education>("EDUCATION", educationKey);
        if (!existing) {
          return errorResponse(404, "NOT_FOUND", `Education record with ID ${id} not found`);
        }
        await deleteItem("EDUCATION", educationKey);
        return successResponse({ deleted: true }, 200, "Education record deleted successfully");
      }
    }

    return errorResponse(404, "NOT_FOUND", `Requested route ${method} ${path} not found`);
  } catch (error: any) {
    console.error("Error occurred in PortfolioAdminFunction:", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
  }
}
