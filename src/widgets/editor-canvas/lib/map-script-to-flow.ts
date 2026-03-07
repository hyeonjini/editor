import type { ExecutionState } from "@/entities/execution";
import type { DataNode, RequestGroupNode, RequestNode, Script, TransactionStep } from "@/entities/script";
import type { EditorFlowGraph } from "@/widgets/editor-canvas/model/flow-graph";
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";
import type { EditorCanvasActionKind } from "@/widgets/editor-canvas/model/flow-node-types";
import { editorFlowNodeTypes } from "@/widgets/editor-canvas/model/flow-node-types";

const fallbackPosition = (index: number) => ({
  x: 96 + (index % 2) * 340,
  y: 96 + index * 190,
});

const getExecutionStatus = (executionState: ExecutionState, nodeId: string) => {
  return executionState.nodeStatuses[nodeId] ?? "idle";
};

const getRequestUrlPreview = (request: RequestNode): string => {
  if (request.url.kind === "static") {
    return request.url.value;
  }

  if (request.url.kind === "template") {
    return request.url.template;
  }

  return request.url.selector.path;
};

const getMethodBreakdown = (node: RequestGroupNode): string => {
  const counts = node.requests.reduce<Record<string, number>>((acc, request) => {
    acc[request.method] = (acc[request.method] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([method, count]) => `${method} ${count}`)
    .join(" · ");
};

interface MapScriptToFlowInput {
  script: Script;
  selectedTransactionId: string | null;
  layout: FlowLayoutSnapshot;
  connections: FlowConnectionSnapshot[];
  executionState: ExecutionState;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeNodeAction: { nodeId: string; kind: string } | null;
  onNodeAction?: (nodeId: string, kind: EditorCanvasActionKind) => void;
}

export const mapScriptToFlow = ({
  script,
  selectedTransactionId,
  layout,
  connections,
  executionState,
  selectedNodeId,
  hoveredNodeId,
  activeNodeAction,
  onNodeAction,
}: MapScriptToFlowInput): EditorFlowGraph => {
  const transaction =
    script.transactions.find((item) => item.id === selectedTransactionId) ?? script.transactions[0] ?? null;

  if (!transaction) {
    return { nodes: [], edges: [] };
  }

  const nodes: EditorFlowGraph["nodes"] = transaction.steps.map((step, index) => {
    const position = layout[step.id]?.position ?? fallbackPosition(index);

    if (step.type === "data") {
      return createDataFlowNode(
        step,
        transaction.name,
        position.x,
        position.y,
        executionState,
        selectedNodeId,
        hoveredNodeId,
        activeNodeAction,
        onNodeAction,
      );
    }

    if (step.type === "request") {
      return createRequestFlowNode(
        step,
        transaction.name,
        position.x,
        position.y,
        executionState,
        selectedNodeId,
        hoveredNodeId,
        activeNodeAction,
        onNodeAction,
      );
    }

    return createRequestGroupFlowNode(
      step,
      transaction.name,
      position.x,
      position.y,
      executionState,
      selectedNodeId,
      hoveredNodeId,
      activeNodeAction,
      onNodeAction,
    );
  });

  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  const edges: EditorFlowGraph["edges"] = connections
    .filter((connection) => visibleNodeIds.has(connection.source) && visibleNodeIds.has(connection.target))
    .map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: "smoothstep",
      animated:
        executionState.activeNodeId === connection.source || executionState.activeNodeId === connection.target,
      deletable: true,
      style: {
        stroke: "#111827",
        strokeWidth: 1.5,
      },
    }));

  return { nodes, edges };
};

const createDataFlowNode = (
  node: DataNode,
  transactionName: string,
  x: number,
  y: number,
  executionState: ExecutionState,
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
  activeNodeAction: { nodeId: string; kind: string } | null,
  onNodeAction?: (nodeId: string, kind: EditorCanvasActionKind) => void,
) => ({
  id: node.id,
  type: editorFlowNodeTypes.dataNode,
  position: { x, y },
  data: {
    nodeId: node.id,
    nodeKind: "data" as const,
    label: node.name,
    description: node.description,
    dataType: node.dataType,
    transactionName,
    executionStatus: getExecutionStatus(executionState, node.id),
    isActive: executionState.activeNodeId === node.id,
    isSelected: selectedNodeId === node.id,
    isHovered: hoveredNodeId === node.id,
    activeActionKind: activeNodeAction?.nodeId === node.id ? activeNodeAction.kind : null,
    onAction: onNodeAction,
  },
});

const createRequestFlowNode = (
  node: RequestNode,
  transactionName: string,
  x: number,
  y: number,
  executionState: ExecutionState,
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
  activeNodeAction: { nodeId: string; kind: string } | null,
  onNodeAction?: (nodeId: string, kind: EditorCanvasActionKind) => void,
) => ({
  id: node.id,
  type: editorFlowNodeTypes.requestNode,
  position: { x, y },
  draggable: true,
  data: {
    nodeId: node.id,
    nodeKind: "request" as const,
    label: node.name,
    description: node.description,
    method: node.method,
    urlPreview: getRequestUrlPreview(node),
    transactionName,
    executionStatus: getExecutionStatus(executionState, node.id),
    isActive: executionState.activeNodeId === node.id,
    isSelected: selectedNodeId === node.id,
    isHovered: hoveredNodeId === node.id,
    activeActionKind: activeNodeAction?.nodeId === node.id ? activeNodeAction.kind : null,
    onAction: onNodeAction,
  },
});

const createRequestGroupFlowNode = (
  node: RequestGroupNode,
  transactionName: string,
  x: number,
  y: number,
  executionState: ExecutionState,
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
  activeNodeAction: { nodeId: string; kind: string } | null,
  onNodeAction?: (nodeId: string, kind: EditorCanvasActionKind) => void,
) => ({
  id: node.id,
  type: editorFlowNodeTypes.requestGroupNode,
  position: { x, y },
  data: {
    nodeId: node.id,
    nodeKind: "request-group" as const,
    label: node.name,
    description: node.description,
    requestCount: node.requests.length,
    methodBreakdown: getMethodBreakdown(node),
    transactionName,
    executionStatus: getExecutionStatus(executionState, node.id),
    isActive: executionState.activeNodeId === node.id,
    isSelected: selectedNodeId === node.id,
    isHovered: hoveredNodeId === node.id,
    activeActionKind: activeNodeAction?.nodeId === node.id ? activeNodeAction.kind : null,
    onAction: onNodeAction,
  },
});

export const getSelectedTransactionSteps = (
  script: Script,
  selectedTransactionId: string | null,
): TransactionStep[] => {
  const transaction =
    script.transactions.find((item) => item.id === selectedTransactionId) ?? script.transactions[0] ?? null;

  return transaction?.steps ?? [];
};
