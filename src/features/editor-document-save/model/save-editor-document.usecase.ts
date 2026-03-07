import type { EditorDocument } from "@/shared/model/editor-document";
import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";
import type { SaveScriptResult } from "@/shared/ports/script-repository.port";

export class SaveEditorDocumentUseCase {
  constructor(private readonly editorDocumentRepository: EditorDocumentRepository) {}

  execute(document: EditorDocument): Promise<SaveScriptResult> {
    return this.editorDocumentRepository.saveDocument(document);
  }
}
