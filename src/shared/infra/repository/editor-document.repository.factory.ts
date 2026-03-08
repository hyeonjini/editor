import { FetchApiClient } from "@/shared/api/http-client";
import { editorDocumentJsonSerializer } from "@/shared/infra/serializer/editor-document-json.serializer";
import { HttpEditorDocumentRepository } from "@/shared/infra/repository/http-editor-document.repository";
import { sharedMockEditorDocumentRepository } from "@/shared/infra/repository/mock-repository.registry";
import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";

export interface EditorDocumentRepositoryFactoryOptions {
  dataSource?: "mock" | "http";
  baseUrl?: string;
}

export function createEditorDocumentRepository(
  options: EditorDocumentRepositoryFactoryOptions = {},
): EditorDocumentRepository {
  const dataSource = options.dataSource ?? (process.env.NEXT_PUBLIC_EDITOR_DOCUMENT_DATA_SOURCE === "http" ? "http" : "mock");

  if (dataSource === "http") {
    return new HttpEditorDocumentRepository(
      new FetchApiClient({
        baseUrl: options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL,
      }),
      editorDocumentJsonSerializer,
    );
  }

  return sharedMockEditorDocumentRepository;
}
