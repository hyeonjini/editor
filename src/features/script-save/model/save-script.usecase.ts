import type { Script } from "@/entities/script";
import type { SaveScriptResult, ScriptRepository } from "@/shared/ports/script-repository.port";

export class SaveScriptUseCase {
  constructor(private readonly scriptRepository: ScriptRepository) {}

  execute(script: Script): Promise<SaveScriptResult> {
    return this.scriptRepository.save(script);
  }
}
