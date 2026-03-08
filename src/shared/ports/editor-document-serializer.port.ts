import type { EditorDocument } from "@/shared/model/editor-document";

export interface EditorDocumentSerializer<TDto> {
  serialize(document: EditorDocument): TDto;
  deserialize(dto: TDto): EditorDocument;
}
