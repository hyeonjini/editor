import type { ScriptDto } from "@/shared/api/dto/script.dto";

export interface LoadScriptResponseDto {
  script: ScriptDto;
  version?: string;
}

export interface SaveScriptRequestDto {
  script: ScriptDto;
}

export interface SaveScriptResponseDto {
  savedAt: string;
  version?: string;
}
