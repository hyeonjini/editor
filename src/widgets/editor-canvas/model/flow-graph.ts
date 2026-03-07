import type { EditorFlowEdge } from "@/widgets/editor-canvas/model/flow-edge-types";
import type { EditorFlowNode } from "@/widgets/editor-canvas/model/flow-node-types";

export interface EditorFlowGraph {
  nodes: EditorFlowNode[];
  edges: EditorFlowEdge[];
}
