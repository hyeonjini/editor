import type { HttpMethod, QueryParam, RequestBody, RequestGroupNode, RequestNode } from "@/entities/script";
import { createScopedId } from "@/entities/script";
import type { HarEntryJson } from "@/shared/infra/har/har-json.parser";

const supportedMethods = new Set<HttpMethod>(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

export interface HarToRequestGroupResult {
  requestGroup: RequestGroupNode;
  warnings: string[];
  importedRequestCount: number;
}

export function mapHarEntriesToRequestGroup(entries: HarEntryJson[]): HarToRequestGroupResult {
  const warnings: string[] = [];
  const requests: RequestNode[] = [];

  entries.forEach((entry, index) => {
    const request = entry.request;

    if (!request?.method || !request.url) {
      warnings.push(`HAR entry ${index + 1} was skipped because method or url is missing.`);
      return;
    }

    const method = request.method.toUpperCase() as HttpMethod;
    if (!supportedMethods.has(method)) {
      warnings.push(`HAR entry ${index + 1} was skipped because method "${request.method}" is not supported.`);
      return;
    }

    try {
      const url = new URL(request.url);
      const requestNode = createRequestNodeFromHarEntry(index, method, request, url);
      requests.push(requestNode);
    } catch {
      warnings.push(`HAR entry ${index + 1} was skipped because url "${request.url}" is invalid.`);
    }
  });

  if (requests.length === 0) {
    throw new Error("HAR import failed: no valid request entries were found.");
  }

  const seed = `${Date.now()}`;

  return {
    requestGroup: {
      id: createScopedId("group", seed),
      type: "request-group",
      name: "Imported HAR Group",
      description: `Imported ${requests.length} request${requests.length === 1 ? "" : "s"} from HAR.`,
      requests,
    },
    warnings,
    importedRequestCount: requests.length,
  };
}

function createRequestNodeFromHarEntry(
  index: number,
  method: HttpMethod,
  request: NonNullable<HarEntryJson["request"]>,
  url: URL,
): RequestNode {
  const seed = `${Date.now()}_${index}`;
  const body = mapRequestBody(request.postData);
  const queryParams = mapQueryParams(request.queryString ?? []);

  return {
    id: createScopedId("req", seed),
    type: "request",
    name: `${method} ${url.pathname || "/"}`,
    method,
    url: {
      kind: "static",
      value: request.url ?? url.toString(),
    },
    headers: (request.headers ?? []).map((header) => ({
      key: header.name ?? "",
      value: header.value ?? "",
      enabled: true,
    })),
    queryParams,
    pathParams: [],
    ...(body ? { body } : {}),
    description: "Imported from HAR file.",
  };
}

function mapQueryParams(items: Array<{ name?: string; value?: string }>): QueryParam[] {
  return items
    .filter((item) => item.name)
    .map((item) => ({
      key: item.name ?? "",
      value: {
        kind: "static",
        value: item.value ?? "",
      },
      enabled: true,
    }));
}

function mapRequestBody(
  postData: NonNullable<NonNullable<HarEntryJson["request"]>["postData"]> | undefined,
): RequestBody | undefined {
  if (!postData) {
    return undefined;
  }

  const mimeType = postData.mimeType?.toLowerCase() ?? "";

  if (mimeType.includes("application/json")) {
    return {
      contentType: "application/json",
      raw: {
        kind: "static",
        value: postData.text ?? "",
      },
    };
  }

  if (mimeType.includes("application/x-www-form-urlencoded")) {
    return {
      contentType: "application/x-www-form-urlencoded",
      formEntries: (postData.params ?? []).map((param) => ({
        key: param.name ?? "",
        value: {
          kind: "static",
          value: param.value ?? "",
        },
        enabled: true,
      })),
    };
  }

  if (mimeType.includes("multipart/form-data")) {
    return {
      contentType: "multipart/form-data",
      formEntries: (postData.params ?? []).map((param) => ({
        key: param.name ?? "",
        value: {
          kind: "static",
          value: param.value ?? param.fileName ?? "",
        },
        enabled: true,
      })),
    };
  }

  if (mimeType.includes("text/plain")) {
    return {
      contentType: "text/plain",
      raw: {
        kind: "static",
        value: postData.text ?? "",
      },
    };
  }

  if (postData.text) {
    return {
      contentType: "text/plain",
      raw: {
        kind: "static",
        value: postData.text,
      },
    };
  }

  return undefined;
}
