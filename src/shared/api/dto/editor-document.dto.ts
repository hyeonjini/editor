import type { ScriptDto } from "@/shared/api/dto/script.dto";

export interface EditorDocumentDto {
  script: ScriptDto;
  view: {
    layout: Record<
      string,
      {
        position: {
          x: number;
          y: number;
        };
        parentId?: string;
      }
    >;
    connections: Record<
      string,
      Array<{
        id: string;
        source: string;
        target: string;
      }>
    >;
  };
}
