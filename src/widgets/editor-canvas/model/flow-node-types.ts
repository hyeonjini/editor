import type { Node, NodeProps } from "@xyflow/react";

import type { NodeExecutionStatus } from "@/entities/execution";

export const editorFlowNodeTypes = {
  dataNode: "dataNode",
  requestNode: "requestNode",
  requestGroupNode: "requestGroupNode",
} as const;

export type EditorFlowNodeType = (typeof editorFlowNodeTypes)[keyof typeof editorFlowNodeTypes];
export type EditorCanvasActionKind = "inspect" | "edit" | "add-after";

interface EditorFlowNodeDataBase {
  [key: string]: unknown;
  nodeId: string;
  label: string;
  description?: string;
  transactionName: string;
  executionStatus: NodeExecutionStatus;
  isActive: boolean;
  isSelected: boolean;
  isHovered: boolean;
  activeActionKind: string | null;
  onAction?: (nodeId: string, kind: EditorCanvasActionKind) => void;
}

export interface DataFlowNodeData extends EditorFlowNodeDataBase {
  nodeKind: "data";
  dataType: string;
}

export interface RequestFlowNodeData extends EditorFlowNodeDataBase {
  nodeKind: "request";
  method: string;
  urlPreview: string;
}

export interface RequestGroupFlowNodeData extends EditorFlowNodeDataBase {
  nodeKind: "request-group";
  requestCount: number;
  methodBreakdown: string;
}

export type EditorFlowNodeData =
  | DataFlowNodeData
  | RequestFlowNodeData
  | RequestGroupFlowNodeData;

export type EditorFlowNode = Node<EditorFlowNodeData, EditorFlowNodeType>;

export type DataFlowNodeProps = NodeProps<Node<DataFlowNodeData, "dataNode">>;
export type RequestFlowNodeProps = NodeProps<Node<RequestFlowNodeData, "requestNode">>;
export type RequestGroupFlowNodeProps = NodeProps<
  Node<RequestGroupFlowNodeData, "requestGroupNode">
>;
