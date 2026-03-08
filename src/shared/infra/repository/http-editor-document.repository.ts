import type {
  LoadEditorDocumentResponseDto,
  SaveEditorDocumentRequestDto,
  SaveEditorDocumentResponseDto,
} from "@/shared/api/dto/editor-document-api.dto";
import type { EditorDocumentDto } from "@/shared/api/dto/editor-document.dto";
import type { ApiClient } from "@/shared/api/http-client";
import type { EditorDocument } from "@/shared/model/editor-document";
import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";
import type { EditorDocumentSerializer } from "@/shared/ports/editor-document-serializer.port";
import type { SaveScriptResult } from "@/shared/ports/script-repository.port";

export class HttpEditorDocumentRepository implements EditorDocumentRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly serializer: EditorDocumentSerializer<EditorDocumentDto>,
  ) {}

  async loadDocument(scriptId: string): Promise<EditorDocument> {
    const response = await this.apiClient.request<LoadEditorDocumentResponseDto>(`/api/editor-documents/${scriptId}`, {
      method: "GET",
    });

    return this.serializer.deserialize(response.document);
  }

  async saveDocument(document: EditorDocument): Promise<SaveScriptResult> {
    const response = await this.apiClient.request<SaveEditorDocumentResponseDto>(`/api/editor-documents/${document.script.id}`, {
      method: "PUT",
      body: {
        document: this.serializer.serialize(document),
      } satisfies SaveEditorDocumentRequestDto,
    });

    return {
      savedAt: response.savedAt,
      version: response.version,
    };
  }
}
