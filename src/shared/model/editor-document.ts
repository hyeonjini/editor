import type { Script } from "@/entities/script";
import type { FlowConnectionMap } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";

export interface PersistedEditorViewState {
  layout: FlowLayoutSnapshot;
  connections: FlowConnectionMap;
}

export interface EditorDocument {
  script: Script;
  view: PersistedEditorViewState;
}
