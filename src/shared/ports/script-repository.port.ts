import type { Script } from "@/entities/script";

export interface SaveScriptResult {
  savedAt: string;
  version?: string;
}

export interface ScriptRepository {
  load(scriptId: string): Promise<Script>;
  save(script: Script): Promise<SaveScriptResult>;
}
