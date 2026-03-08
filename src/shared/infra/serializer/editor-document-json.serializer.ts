import type { EditorDocumentDto } from "@/shared/api/dto/editor-document.dto";
import { scriptJsonSerializer } from "@/shared/infra/serializer/script-json.serializer";
import type { EditorDocumentSerializer } from "@/shared/ports/editor-document-serializer.port";

export const editorDocumentJsonSerializer: EditorDocumentSerializer<EditorDocumentDto> = {
  serialize(document) {
    return {
      script: scriptJsonSerializer.serialize(document.script),
      view: {
        layout: Object.fromEntries(
          Object.entries(document.view.layout).map(([nodeId, layout]) => [
            nodeId,
            {
              position: {
                x: layout.position.x,
                y: layout.position.y,
              },
              ...(layout.parentId ? { parentId: layout.parentId } : {}),
            },
          ]),
        ),
        connections: Object.fromEntries(
          Object.entries(document.view.connections).map(([transactionId, connections]) => [
            transactionId,
            connections.map((connection) => ({
              id: connection.id,
              source: connection.source,
              target: connection.target,
            })),
          ]),
        ),
      },
    };
  },
  deserialize(dto) {
    return {
      script: scriptJsonSerializer.deserialize(dto.script),
      view: {
        layout: Object.fromEntries(
          Object.entries(dto.view.layout).map(([nodeId, layout]) => [
            nodeId,
            {
              position: {
                x: layout.position.x,
                y: layout.position.y,
              },
              ...(layout.parentId ? { parentId: layout.parentId } : {}),
            },
          ]),
        ),
        connections: Object.fromEntries(
          Object.entries(dto.view.connections).map(([transactionId, connections]) => [
            transactionId,
            connections.map((connection) => ({
              id: connection.id,
              source: connection.source,
              target: connection.target,
            })),
          ]),
        ),
      },
    };
  },
};
