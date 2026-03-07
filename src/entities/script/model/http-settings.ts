export interface HeaderEntry {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HttpSettings {
  baseUrl?: string;
  timeoutMs?: number;
  followRedirects?: boolean;
  defaultHeaders: HeaderEntry[];
  cookiePolicy?: "inherit" | "isolate" | "disabled";
  connectionReuse?: boolean;
}
