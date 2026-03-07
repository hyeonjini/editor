"use client";

import "@xyflow/react/dist/style.css";

import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect, useState } from "react";

import type { ExecutionState } from "@/entities/execution";
import type { Script } from "@/entities/script";
import { validateConnection } from "@/widgets/editor-canvas";
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";
import type { EditorFlowEdge } from "@/widgets/editor-canvas/model/flow-edge-types";
import type { EditorCanvasActionKind, EditorFlowNode } from "@/widgets/editor-canvas/model/flow-node-types";
import { editorFlowNodeTypes } from "@/widgets/editor-canvas/model/flow-node-types";
import { mapScriptToFlow } from "@/widgets/editor-canvas/lib/map-script-to-flow";
import { DataFlowNode } from "@/widgets/editor-canvas/ui/nodes/data-flow-node";
import { RequestFlowNode } from "@/widgets/editor-canvas/ui/nodes/request-flow-node";
import { RequestGroupFlowNode } from "@/widgets/editor-canvas/ui/nodes/request-group-flow-node";

const nodeTypes = {
  [editorFlowNodeTypes.dataNode]: DataFlowNode,
  [editorFlowNodeTypes.requestNode]: RequestFlowNode,
  [editorFlowNodeTypes.requestGroupNode]: RequestGroupFlowNode,
};

interface EditorCanvasProps {
  script: Script;
  selectedTransactionId: string | null;
  executionState: ExecutionState;
  layout: FlowLayoutSnapshot;
  connections: FlowConnectionSnapshot[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeNodeAction: { nodeId: string; kind: string } | null;
  onLayoutChange: (layout: FlowLayoutSnapshot) => void;
  onConnectionsChange: (connections: FlowConnectionSnapshot[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeHoverChange?: (nodeId: string | null) => void;
  onNodeAction?: (nodeId: string, kind: EditorCanvasActionKind) => void;
}

export function EditorCanvas({
  script,
  selectedTransactionId,
  executionState,
  layout,
  connections,
  selectedNodeId,
  hoveredNodeId,
  activeNodeAction,
  onLayoutChange,
  onConnectionsChange,
  onNodeSelect,
  onNodeHoverChange,
  onNodeAction,
}: EditorCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<EditorFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditorFlowEdge>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const graph = mapScriptToFlow({
      script,
      selectedTransactionId,
      executionState,
      layout,
      connections,
      selectedNodeId,
      hoveredNodeId,
      activeNodeAction,
      onNodeAction,
    });

    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [
    activeNodeAction,
    executionState,
    hoveredNodeId,
    layout,
    connections,
    script,
    selectedTransactionId,
    selectedNodeId,
    onNodeAction,
    setEdges,
    setNodes,
  ]);

  return (
    <div className="relative h-full min-h-[720px] overflow-hidden bg-white">
      <ReactFlow<EditorFlowNode, EditorFlowEdge>
        fitView
        minZoom={0.5}
        maxZoom={1.4}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(connection: Connection) => {
          if (!connection.source || !connection.target) {
            return;
          }

          const validation = validateConnection({
            source: connection.source,
            target: connection.target,
            existingConnections: connections,
            visibleNodeIds: new Set(nodes.map((node) => node.id)),
          });

          if (!validation.valid) {
            setConnectionError(validation.reason);
            return;
          }

          setConnectionError(null);

          const nextConnection: FlowConnectionSnapshot = {
            id: `manual:${connection.source}->${connection.target}`,
            source: connection.source,
            target: connection.target,
          };

          const nextEdges = addEdge(
            {
              ...connection,
              id: nextConnection.id,
              type: "smoothstep",
            },
            edges as Edge[],
          );

          setEdges(nextEdges as EditorFlowEdge[]);
          onConnectionsChange(
            nextEdges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
            })),
          );
        }}
        onEdgesDelete={(deletedEdges) => {
          setConnectionError(null);
          const deletedIds = new Set(deletedEdges.map((edge) => edge.id));
          const nextConnections = edges
            .filter((edge) => !deletedIds.has(edge.id))
            .map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
            }));
          onConnectionsChange(nextConnections);
        }}
        onNodeDragStop={(_, node) => {
          onLayoutChange({
            ...layout,
            [node.id]: {
              position: node.position,
              parentId: node.parentId,
            },
          });
        }}
        onNodeClick={(_, node) => {
          setConnectionError(null);
          onNodeSelect?.(node.id);
        }}
        onNodeMouseEnter={(_, node) => {
          onNodeHoverChange?.(node.id);
        }}
        onNodeMouseLeave={() => {
          onNodeHoverChange?.(null);
        }}
        onPaneClick={() => {
          setConnectionError(null);
          onNodeSelect?.(null);
          onNodeHoverChange?.(null);
        }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          deletable: true,
        }}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background color="#cbd5e1" gap={20} variant={BackgroundVariant.Dots} />
        <Controls position="bottom-right" />
        <MiniMap
          pannable
          zoomable
          position="bottom-left"
          nodeColor={(node) => {
            if (node.type === editorFlowNodeTypes.dataNode) {
              return "#f59e0b";
            }
            if (node.type === editorFlowNodeTypes.requestGroupNode) {
              return "#10b981";
            }
            return "#334155";
          }}
          className="!rounded-2xl !border !border-slate-200 !bg-white/85"
        />
      </ReactFlow>
      {connectionError ? (
        <div className="absolute bottom-20 right-6 rounded-2xl border border-rose-200 bg-white/95 px-4 py-3 text-xs text-rose-700 shadow-sm">
          {connectionError}
        </div>
      ) : null}
    </div>
  );
}
