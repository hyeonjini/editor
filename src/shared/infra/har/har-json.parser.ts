export interface HarJson {
  log: {
    version?: string;
    entries?: HarEntryJson[];
  };
}

export interface HarEntryJson {
  request?: {
    method?: string;
    url?: string;
    headers?: Array<{ name?: string; value?: string }>;
    queryString?: Array<{ name?: string; value?: string }>;
    postData?: {
      mimeType?: string;
      text?: string;
      params?: Array<{ name?: string; value?: string; fileName?: string }>;
    };
  };
}

export function parseHarJson(harJson: string): HarJson {
  const parsed = JSON.parse(harJson) as unknown;

  if (!isHarJson(parsed)) {
    throw new Error("Invalid HAR file: expected log.entries[] structure.");
  }

  return parsed;
}

function isHarJson(value: unknown): value is HarJson {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (!candidate.log || typeof candidate.log !== "object") {
    return false;
  }

  const log = candidate.log as Record<string, unknown>;
  return !("entries" in log) || Array.isArray(log.entries);
}
