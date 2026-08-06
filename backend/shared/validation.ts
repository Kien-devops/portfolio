export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 150;
}

export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  // Format YYYY-MM
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const [year, month] = dateStr.split("-").map(Number);
  return month >= 1 && month <= 12;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProfile(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0 || data.name.length > 100) {
    errors.push({ field: "name", message: "Name is required and must be under 100 characters." });
  }
  if (!data.headline || typeof data.headline !== "string" || data.headline.trim().length === 0 || data.headline.length > 200) {
    errors.push({ field: "headline", message: "Headline is required and must be under 200 characters." });
  }
  if (!data.bio || typeof data.bio !== "string" || data.bio.trim().length === 0 || data.bio.length > 2000) {
    errors.push({ field: "bio", message: "Bio is required and must be under 2000 characters." });
  }
  if (!data.email || typeof data.email !== "string" || !isValidEmail(data.email)) {
    errors.push({ field: "email", message: "A valid email is required." });
  }
  if (data.githubUrl && (typeof data.githubUrl !== "string" || data.githubUrl.length > 500)) {
    errors.push({ field: "githubUrl", message: "Github URL must be a valid URL string under 500 characters." });
  }
  if (data.linkedinUrl && (typeof data.linkedinUrl !== "string" || data.linkedinUrl.length > 500)) {
    errors.push({ field: "linkedinUrl", message: "LinkedIn URL must be a valid URL string under 500 characters." });
  }
  if (!data.avatarUrl || typeof data.avatarUrl !== "string" || data.avatarUrl.length > 500) {
    errors.push({ field: "avatarUrl", message: "Avatar URL is required and must be under 500 characters." });
  }
  return errors;
}

export function validateProject(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0 || data.name.length > 150) {
    errors.push({ field: "name", message: "Name is required and must be under 150 characters." });
  }
  if (!data.slug || typeof data.slug !== "string" || !isValidSlug(data.slug)) {
    errors.push({ field: "slug", message: "Slug is required and must contain only lowercase letters, numbers, and hyphens." });
  }
  if (!data.summary || typeof data.summary !== "string" || data.summary.trim().length === 0 || data.summary.length > 500) {
    errors.push({ field: "summary", message: "Summary is required and must be under 500 characters." });
  }
  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required." });
  }
  if (!Array.isArray(data.technologies)) {
    errors.push({ field: "technologies", message: "Technologies must be an array of strings." });
  } else if (data.technologies.some((t: any) => typeof t !== "string" || t.trim().length === 0)) {
    errors.push({ field: "technologies", message: "Technologies array cannot contain empty strings." });
  }
  if (data.githubUrl && (typeof data.githubUrl !== "string" || data.githubUrl.length > 500)) {
    errors.push({ field: "githubUrl", message: "Github URL must be under 500 characters." });
  }
  if (data.demoUrl && (typeof data.demoUrl !== "string" || data.demoUrl.length > 500)) {
    errors.push({ field: "demoUrl", message: "Demo URL must be under 500 characters." });
  }
  if (!data.imageUrl || typeof data.imageUrl !== "string" || data.imageUrl.length > 500) {
    errors.push({ field: "imageUrl", message: "Image URL is required." });
  }
  if (typeof data.displayOrder !== "number") {
    errors.push({ field: "displayOrder", message: "Display order must be a number." });
  }
  if (typeof data.published !== "boolean") {
    errors.push({ field: "published", message: "Published must be a boolean." });
  }
  return errors;
}

export function validateSkill(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0 || data.name.length > 50) {
    errors.push({ field: "name", message: "Name is required and must be under 50 characters." });
  }
  if (!data.category || typeof data.category !== "string" || data.category.trim().length === 0 || data.category.length > 50) {
    errors.push({ field: "category", message: "Category is required and must be under 50 characters." });
  }
  if (typeof data.level !== "number" || data.level < 0 || data.level > 100) {
    errors.push({ field: "level", message: "Level must be a number between 0 and 100." });
  }
  if (typeof data.displayOrder !== "number") {
    errors.push({ field: "displayOrder", message: "Display order must be a number." });
  }
  return errors;
}

export function validateExperience(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.company || typeof data.company !== "string" || data.company.trim().length === 0 || data.company.length > 100) {
    errors.push({ field: "company", message: "Company is required and must be under 100 characters." });
  }
  if (!data.position || typeof data.position !== "string" || data.position.trim().length === 0 || data.position.length > 100) {
    errors.push({ field: "position", message: "Position is required and must be under 100 characters." });
  }
  if (!isValidDate(data.startDate)) {
    errors.push({ field: "startDate", message: "Start date must be in YYYY-MM format." });
  }
  if (data.endDate && !isValidDate(data.endDate)) {
    errors.push({ field: "endDate", message: "End date must be null or in YYYY-MM format." });
  }
  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required." });
  }
  if (typeof data.displayOrder !== "number") {
    errors.push({ field: "displayOrder", message: "Display order must be a number." });
  }
  return errors;
}

export function validateEducation(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.school || typeof data.school !== "string" || data.school.trim().length === 0 || data.school.length > 150) {
    errors.push({ field: "school", message: "School is required and must be under 150 characters." });
  }
  if (!data.major || typeof data.major !== "string" || data.major.trim().length === 0 || data.major.length > 100) {
    errors.push({ field: "major", message: "Major is required and must be under 100 characters." });
  }
  if (!isValidDate(data.startDate)) {
    errors.push({ field: "startDate", message: "Start date must be in YYYY-MM format." });
  }
  if (!isValidDate(data.endDate)) {
    errors.push({ field: "endDate", message: "End date must be in YYYY-MM format." });
  }
  if (data.description && (typeof data.description !== "string" || data.description.length > 1000)) {
    errors.push({ field: "description", message: "Description must be a string under 1000 characters." });
  }
  return errors;
}

export function validateContact(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0 || data.name.length > 100) {
    errors.push({ field: "name", message: "Name is required and must be under 100 characters." });
  }
  if (!data.email || typeof data.email !== "string" || !isValidEmail(data.email)) {
    errors.push({ field: "email", message: "A valid email is required." });
  }
  if (!data.subject || typeof data.subject !== "string" || data.subject.trim().length === 0 || data.subject.length > 200) {
    errors.push({ field: "subject", message: "Subject is required and must be under 200 characters." });
  }
  if (!data.message || typeof data.message !== "string" || data.message.trim().length === 0 || data.message.length > 2000) {
    errors.push({ field: "message", message: "Message is required and must be under 2000 characters." });
  }
  // Honeypot field validation: website is the honeypot
  if (data.website && typeof data.website === "string" && data.website.trim().length > 0) {
    errors.push({ field: "website", message: "Spam detected." });
  }
  return errors;
}

export function validateBlog(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0 || data.title.length > 150) {
    errors.push({ field: "title", message: "Title is required and must be under 150 characters." });
  }
  if (!data.slug || typeof data.slug !== "string" || !isValidSlug(data.slug)) {
    errors.push({ field: "slug", message: "Slug is required and must contain only lowercase letters, numbers, and hyphens." });
  }
  if (!data.summary || typeof data.summary !== "string" || data.summary.trim().length === 0 || data.summary.length > 500) {
    errors.push({ field: "summary", message: "Summary is required and must be under 500 characters." });
  }
  if (!data.content || typeof data.content !== "string" || data.content.trim().length === 0) {
    errors.push({ field: "content", message: "Content is required." });
  }
  if (!data.coverImage || typeof data.coverImage !== "string" || data.coverImage.length > 500) {
    errors.push({ field: "coverImage", message: "Cover image URL is required." });
  }
  if (!Array.isArray(data.tags)) {
    errors.push({ field: "tags", message: "Tags must be an array of strings." });
  } else if (data.tags.some((t: any) => typeof t !== "string" || t.trim().length === 0)) {
    errors.push({ field: "tags", message: "Tags array cannot contain empty strings." });
  }
  if (typeof data.published !== "boolean") {
    errors.push({ field: "published", message: "Published must be a boolean." });
  }
  return errors;
}
