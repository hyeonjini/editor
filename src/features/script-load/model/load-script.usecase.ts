import type { Script } from "@/entities/script";
import type { ScriptRepository } from "@/shared/ports/script-repository.port";

export class LoadScriptUseCase {
  constructor(private readonly scriptRepository: ScriptRepository) {}

  execute(scriptId: string): Promise<Script> {
    return this.scriptRepository.load(scriptId);
  }
}
