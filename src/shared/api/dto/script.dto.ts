export interface ScriptDto {
  id: string;
  name: string;
  description?: string;
  httpSettings: {
    baseUrl?: string;
    timeoutMs?: number;
    followRedirects?: boolean;
    defaultHeaders: Array<{ key: string; value: string; enabled: boolean }>;
    cookiePolicy?: "inherit" | "isolate" | "disabled";
    connectionReuse?: boolean;
  };
  transactions: Array<{
    id: string;
    name: string;
    description?: string;
    steps: unknown[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}
