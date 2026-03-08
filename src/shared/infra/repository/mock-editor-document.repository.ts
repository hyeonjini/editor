import type { EditorDocument } from "@/shared/model/editor-document";
import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";
import type { SaveScriptResult } from "@/shared/ports/script-repository.port";
import type { MockScriptRepository } from "@/shared/infra/repository/mock-script.repository";

export class MockEditorDocumentRepository implements EditorDocumentRepository {
  constructor(private readonly scriptRepository: MockScriptRepository) {}

  loadDocument(scriptId: string): Promise<EditorDocument> {
    return this.scriptRepository.loadDocument(scriptId);
  }

  saveDocument(document: EditorDocument): Promise<SaveScriptResult> {
    return this.scriptRepository.saveDocument(document);
  }
}
