import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { putItem } from "../../shared/dynamodb.js";
import { successResponse, errorResponse } from "../../shared/response.js";
import { validateContact } from "../../shared/validation.js";
import { Contact } from "../../shared/types.js";
import { randomUUID } from "crypto";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const path = event.rawPath;
    const method = event.requestContext.http.method;

    console.log(`Contact function received: ${method} ${path}`);

    // POST /api/contacts (Public contact submission)
    if (path === "/api/contacts" && method === "POST") {
      // Validate payload size (e.g. max 10KB)
      const contentLength = event.headers["content-length"] || event.headers["Content-Length"];
      if (contentLength && parseInt(contentLength, 10) > 10240) {
        return errorResponse(400, "PAYLOAD_TOO_LARGE", "Request body is too large (max 10KB)");
      }

      if (!event.body) {
        return errorResponse(400, "BAD_REQUEST", "Request body is empty");
      }

      let data: any;
      try {
        data = JSON.parse(event.body);
      } catch (err) {
        return errorResponse(400, "INVALID_JSON", "Request body is not a valid JSON");
      }

      const errors = validateContact(data);
      if (errors.length > 0) {
        // If it's a honeypot match, it returns validation error "Spam detected."
        const isSpam = errors.some((e) => e.field === "website");
        if (isSpam) {
          // Return success response to fool spambots, but do not save to DynamoDB
          console.warn("Spam contact attempt blocked via honeypot field.");
          return successResponse({ status: "sent" }, 201, "Message sent successfully (honeypot check)");
        }
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Input validation failed",
              details: errors,
            },
          }),
        };
      }

      const contactId = randomUUID();
      const createdAt = new Date().toISOString();
      const newContact: Contact = {
        PK: "CONTACT",
        SK: `CONTACT#${createdAt}#${contactId}`,
        contactId,
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: "NEW",
        createdAt,
      };

      await putItem(newContact);
      return successResponse({ contactId }, 201, "Message sent successfully");
    }

    return errorResponse(404, "NOT_FOUND", `Requested route ${method} ${path} not found`);
  } catch (error: any) {
    console.error("Error occurred in ContactFunction:", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
  }
}
