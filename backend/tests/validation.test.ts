import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidSlug,
  validateProfile,
  validateProject,
  validateSkill,
  validateExperience,
  validateContact,
} from "../shared/validation.js";

describe("Input Validation Utilities", () => {
  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+label@sub.domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("testexample.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
    });
  });

  describe("isValidSlug", () => {
    it("should accept valid slugs", () => {
      expect(isValidSlug("serverless-portfolio-123")).toBe(true);
      expect(isValidSlug("valid-slug")).toBe(true);
    });

    it("should reject invalid slugs", () => {
      expect(isValidSlug("Invalid-Slug")).toBe(false); // uppercase
      expect(isValidSlug("invalid_slug")).toBe(false); // underscore
      expect(isValidSlug("invalid--slug")).toBe(false); // double hyphen
    });
  });

  describe("validateProfile", () => {
    it("should validate a correct profile", () => {
      const data = {
        name: "Test Name",
        headline: "Test Headline",
        bio: "Test Bio",
        email: "test@example.com",
        avatarUrl: "/content/avatar.jpg",
      };
      const errors = validateProfile(data);
      expect(errors.length).toBe(0);
    });

    it("should catch validation errors in profile", () => {
      const data = {
        name: "",
        headline: "Test Headline",
        bio: "Test Bio",
        email: "bad-email",
        avatarUrl: "",
      };
      const errors = validateProfile(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === "name")).toBe(true);
      expect(errors.some((e) => e.field === "email")).toBe(true);
    });
  });

  describe("validateContact & Honeypot", () => {
    it("should accept valid contact inputs", () => {
      const data = {
        name: "Visitor",
        email: "visitor@example.com",
        subject: "Work",
        message: "Hello details here",
      };
      const errors = validateContact(data);
      expect(errors.length).toBe(0);
    });

    it("should trigger validation error on spam (honeypot field filled)", () => {
      const data = {
        name: "Visitor",
        email: "visitor@example.com",
        subject: "Work",
        message: "Hello details here",
        website: "http://spambot.com", // honeypot
      };
      const errors = validateContact(data);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe("website");
      expect(errors[0].message).toBe("Spam detected.");
    });
  });
});
