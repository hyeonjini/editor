import { FetchApiClient } from "@/shared/api/http-client";
import { sharedMockScriptRepository } from "@/shared/infra/repository/mock-repository.registry";
import { HttpScriptRepository } from "@/shared/infra/repository/http-script.repository";
import { scriptJsonSerializer } from "@/shared/infra/serializer/script-json.serializer";
import type { ScriptRepository } from "@/shared/ports/script-repository.port";

export interface ScriptRepositoryFactoryOptions {
  dataSource?: "mock" | "http";
  baseUrl?: string;
}

export function createScriptRepository(
  options: ScriptRepositoryFactoryOptions = {},
): ScriptRepository {
  const dataSource =
    options.dataSource ?? (process.env.NEXT_PUBLIC_SCRIPT_DATA_SOURCE === "http" ? "http" : "mock");

  if (dataSource === "http") {
    return new HttpScriptRepository(
      new FetchApiClient({
        baseUrl: options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL,
      }),
      scriptJsonSerializer,
    );
  }

  return sharedMockScriptRepository;
}
