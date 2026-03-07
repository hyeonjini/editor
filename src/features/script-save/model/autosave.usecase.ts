import type { Script } from "@/entities/script";
import { debounce } from "@/shared/lib/debounce";
import type { SaveScriptResult } from "@/shared/ports/script-repository.port";

type SaveHandler = (script: Script) => Promise<SaveScriptResult>;

export class AutosaveUseCase {
  private readonly triggerSave: (script: Script) => void;

  constructor(handler: SaveHandler, debounceMs = 800) {
    this.triggerSave = debounce((script) => {
      void handler(script);
    }, debounceMs);
  }

  schedule(script: Script): void {
    this.triggerSave(script);
  }
}
