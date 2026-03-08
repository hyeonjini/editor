import type { LoadScriptResponseDto, SaveScriptRequestDto, SaveScriptResponseDto } from "@/shared/api/dto/script-api.dto";
import type { ApiClient } from "@/shared/api/http-client";
import type { ScriptRepository } from "@/shared/ports/script-repository.port";
import type { ScriptSerializer } from "@/shared/ports/script-serializer.port";
import type { ScriptDto } from "@/shared/api/dto/script.dto";

export class HttpScriptRepository implements ScriptRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly serializer: ScriptSerializer<ScriptDto>,
  ) {}

  async load(scriptId: string) {
    const response = await this.apiClient.request<LoadScriptResponseDto>(`/api/scripts/${scriptId}`, {
      method: "GET",
    });

    return this.serializer.deserialize(response.script);
  }

  async save(script: Parameters<ScriptRepository["save"]>[0]) {
    const response = await this.apiClient.request<SaveScriptResponseDto>(`/api/scripts/${script.id}`, {
      method: "PUT",
      body: {
        script: this.serializer.serialize(script),
      } satisfies SaveScriptRequestDto,
    });

    return {
      savedAt: response.savedAt,
      version: response.version,
    };
  }
}
