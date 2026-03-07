import type { SaveScriptResult } from "@/shared/ports/script-repository.port";
import type { EditorDocument } from "@/shared/model/editor-document";

export interface EditorDocumentRepository {
  loadDocument(scriptId: string): Promise<EditorDocument>;
  saveDocument(document: EditorDocument): Promise<SaveScriptResult>;
}
