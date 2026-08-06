import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "../shared/response.js";

describe("Response formatting helpers", () => {
  it("should format success responses with correct schema and CORS headers", () => {
    const data = { profileId: "123" };
    const response = successResponse(data, 201, "Created");

    expect(response.statusCode).toBe(201);
    expect(response.headers).toBeDefined();
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    
    const parsedBody = JSON.parse(response.body);
    expect(parsedBody.success).toBe(true);
    expect(parsedBody.data).toEqual(data);
    expect(parsedBody.message).toBe("Created");
  });

  it("should format error responses with correct error codes", () => {
    const response = errorResponse(400, "BAD_REQUEST", "Invalid inputs");

    expect(response.statusCode).toBe(400);
    const parsedBody = JSON.parse(response.body);
    expect(parsedBody.success).toBe(false);
    expect(parsedBody.error.code).toBe("BAD_REQUEST");
    expect(parsedBody.error.message).toBe("Invalid inputs");
  });
});
