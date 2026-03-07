import type { HttpMethod } from "@/entities/script";

export interface RequestNodeEditDraft {
  name: string;
  method: HttpMethod;
  url: string;
  description: string;
}

export interface RequestNodeEditValidationErrors {
  name?: string;
  url?: string;
  description?: string;
}

export interface RequestNodeEditValidationResult {
  isValid: boolean;
  errors: RequestNodeEditValidationErrors;
}

const REQUEST_NAME_MAX_LENGTH = 80;
const REQUEST_URL_MAX_LENGTH = 2048;
const REQUEST_DESCRIPTION_MAX_LENGTH = 240;

export function validateRequestNodeEditDraft(
  draft: RequestNodeEditDraft,
): RequestNodeEditValidationResult {
  const errors: RequestNodeEditValidationErrors = {};
  const trimmedName = draft.name.trim();
  const trimmedUrl = draft.url.trim();

  if (!trimmedName) {
    errors.name = "Request name is required.";
  } else if (trimmedName.length > REQUEST_NAME_MAX_LENGTH) {
    errors.name = `Use ${REQUEST_NAME_MAX_LENGTH} characters or fewer for the request name.`;
  }

  if (!trimmedUrl) {
    errors.url = "URL is required.";
  } else if (trimmedUrl.length > REQUEST_URL_MAX_LENGTH) {
    errors.url = `Use ${REQUEST_URL_MAX_LENGTH} characters or fewer for the URL.`;
  } else if (/\s/.test(trimmedUrl)) {
    errors.url = "URL cannot contain spaces.";
  }

  if (draft.description.trim().length > REQUEST_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Use ${REQUEST_DESCRIPTION_MAX_LENGTH} characters or fewer for the description.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
