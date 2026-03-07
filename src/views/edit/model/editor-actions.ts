import type { ExecutionEvent } from "@/entities/execution";
import type { Script } from "@/entities/script";
import type { EditorDocument } from "@/shared/model/editor-document";
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";
import type { EditorNodeActionKind } from "@/views/edit/model/editor-view-state";

export type EditorAction =
  | { type: "editor/document-loaded"; payload: EditorDocument }
  | { type: "editor/script-updated"; payload: Script }
  | { type: "editor/layout-changed"; payload: FlowLayoutSnapshot }
  | {
      type: "editor/transaction-connections-changed";
      payload: { transactionId: string; connections: FlowConnectionSnapshot[] };
    }
  | { type: "editor/transaction-selected"; payload: { transactionId: string | null } }
  | { type: "editor/node-selected"; payload: { nodeId: string | null } }
  | { type: "editor/node-hovered"; payload: { nodeId: string | null } }
  | { type: "editor/node-action-opened"; payload: { nodeId: string; kind: EditorNodeActionKind } }
  | { type: "editor/node-action-cleared" }
  | { type: "editor/save-started" }
  | { type: "editor/save-succeeded"; payload: { savedAt: string } }
  | { type: "editor/save-failed"; payload: { message: string } }
  | { type: "editor/execution-event-received"; payload: ExecutionEvent };
