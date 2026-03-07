import type { PersistedEditorViewState } from "@/shared/model/editor-document";
import type { FlowConnectionMap } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";

export type EditorNodeActionKind = "inspect" | "edit" | "add-after";

export interface EditorNodeActionState {
  nodeId: string;
  kind: EditorNodeActionKind;
}

export interface EditorInteractionState {
  selectedTransactionId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeNodeAction: EditorNodeActionState | null;
}

export interface EditorViewState extends PersistedEditorViewState {
  interaction: EditorInteractionState;
}

export const createInitialEditorViewState = (
  layout: FlowLayoutSnapshot = {},
  connections: FlowConnectionMap = {},
): EditorViewState => ({
  layout,
  connections,
  interaction: {
    selectedTransactionId: null,
    selectedNodeId: null,
    hoveredNodeId: null,
    activeNodeAction: null,
  },
});
