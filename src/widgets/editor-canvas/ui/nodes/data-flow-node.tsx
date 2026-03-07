"use client";

import { Handle, Position } from "@xyflow/react";

import type { DataFlowNodeProps } from "@/widgets/editor-canvas/model/flow-node-types";
import { DataNodeIcon, NodeFrame } from "@/widgets/editor-canvas/ui/nodes/node-frame";

export function DataFlowNode({ data }: DataFlowNodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-4 !w-4 !border-2 !border-amber-300 !bg-white"
      />
      <NodeFrame
        nodeId={data.nodeId}
        title={data.label}
        subtitle="DATA"
        meta={data.dataType}
        tone="amber"
        status={data.executionStatus}
        isActive={data.isActive}
        isSelected={data.isSelected}
        isHovered={data.isHovered}
        activeActionKind={data.activeActionKind}
        icon={<DataNodeIcon />}
        onAction={data.onAction}
      >
        {data.description ?? data.transactionName}
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-4 !w-4 !border-2 !border-amber-300 !bg-white"
      />
    </>
  );
}
