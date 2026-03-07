import type { HeaderEntry } from "@/entities/script/model/http-settings";
import type { ValueExpression, ValueSelector } from "@/entities/script/model/value-expression";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface QueryParam {
  key: string;
  value: ValueExpression;
  enabled: boolean;
}

export interface PathParam {
  key: string;
  value: ValueExpression;
}

export interface FormEntry {
  key: string;
  value: ValueExpression;
  enabled: boolean;
}

export interface RequestBody {
  contentType:
    | "application/json"
    | "application/x-www-form-urlencoded"
    | "text/plain"
    | "multipart/form-data"
    | "none";
  raw?: ValueExpression;
  formEntries?: FormEntry[];
}

export interface AssertionRule {
  id: string;
  kind: "status" | "body" | "header" | "json-path";
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte" | "exists";
  expected?: string | number | boolean;
  target?: string;
}

export interface VariableBinding {
  id: string;
  source: ValueSelector;
  targetKey: string;
}

export interface DataNode {
  id: string;
  type: "data";
  name: string;
  dataType: "string" | "number" | "boolean" | "json" | "array" | "object";
  value: unknown;
  description?: string;
}

export interface RequestNode {
  id: string;
  type: "request";
  name: string;
  method: HttpMethod;
  url: ValueExpression;
  headers: HeaderEntry[];
  queryParams: QueryParam[];
  pathParams: PathParam[];
  body?: RequestBody;
  assertions?: AssertionRule[];
  variableBindings?: VariableBinding[];
  timeoutMs?: number;
  description?: string;
}

export interface RequestGroupNode {
  id: string;
  type: "request-group";
  name: string;
  requests: RequestNode[];
  description?: string;
}

export type TransactionStep = DataNode | RequestNode | RequestGroupNode;
