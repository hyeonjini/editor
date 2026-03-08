export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | object | null;
}

export interface ApiClient {
  request<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
}

export interface FetchApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export class FetchApiClient implements ApiClient {
  constructor(private readonly options: FetchApiClientOptions = {}) {}

  async request<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
    const url = new URL(path, this.options.baseUrl ?? "http://localhost").toString();
    const response = await fetch(url, {
      ...options,
      headers: this.buildHeaders(options.headers, options.body),
      body: this.serializeBody(options.body),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new ApiClientError(
        `Request failed with status ${response.status}: ${response.statusText}`,
        response.status,
        responseBody,
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private buildHeaders(headers: HeadersInit | undefined, body: ApiRequestOptions["body"]): Headers {
    const nextHeaders = new Headers(this.options.defaultHeaders);

    if (headers) {
      new Headers(headers).forEach((value, key) => {
        nextHeaders.set(key, value);
      });
    }

    if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      nextHeaders.set("Content-Type", "application/json");
    }

    return nextHeaders;
  }

  private serializeBody(body: ApiRequestOptions["body"]): BodyInit | undefined {
    if (!body) {
      return undefined;
    }

    if (typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      return JSON.stringify(body);
    }

    return body;
  }
}
