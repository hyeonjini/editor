import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";
import type { EditorDocument } from "@/shared/model/editor-document";

export class LoadEditorDocumentUseCase {
  constructor(private readonly editorDocumentRepository: EditorDocumentRepository) {}

  execute(scriptId: string): Promise<EditorDocument> {
    return this.editorDocumentRepository.loadDocument(scriptId);
  }
}
