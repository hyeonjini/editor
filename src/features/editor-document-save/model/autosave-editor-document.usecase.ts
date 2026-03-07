import { debounce } from "@/shared/lib/debounce";
import type { EditorDocument } from "@/shared/model/editor-document";
import type { SaveScriptResult } from "@/shared/ports/script-repository.port";

type SaveHandler = (document: EditorDocument) => Promise<SaveScriptResult>;

export class AutosaveEditorDocumentUseCase {
  private readonly triggerSave: (document: EditorDocument) => void;

  constructor(handler: SaveHandler, debounceMs = 800) {
    this.triggerSave = debounce((document) => {
      void handler(document);
    }, debounceMs);
  }

  schedule(document: EditorDocument): void {
    this.triggerSave(document);
  }
}
