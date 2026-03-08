import type { EditorDocumentDto } from "@/shared/api/dto/editor-document.dto";

export interface LoadEditorDocumentResponseDto {
  document: EditorDocumentDto;
  version?: string;
}

export interface SaveEditorDocumentRequestDto {
  document: EditorDocumentDto;
}

export interface SaveEditorDocumentResponseDto {
  savedAt: string;
  version?: string;
}
