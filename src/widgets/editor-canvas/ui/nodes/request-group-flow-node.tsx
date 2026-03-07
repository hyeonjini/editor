"use client";

import { Handle, Position } from "@xyflow/react";

import type { RequestGroupFlowNodeProps } from "@/widgets/editor-canvas/model/flow-node-types";
import { NodeFrame, RequestGroupIcon } from "@/widgets/editor-canvas/ui/nodes/node-frame";

export function RequestGroupFlowNode({ data }: RequestGroupFlowNodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-4 !w-4 !border-2 !border-emerald-300 !bg-white"
      />
      <NodeFrame
        nodeId={data.nodeId}
        title={data.label}
        subtitle="GROUP"
        meta={`${data.requestCount} requests`}
        tone="emerald"
        status={data.executionStatus}
        isActive={data.isActive}
        isSelected={data.isSelected}
        isHovered={data.isHovered}
        activeActionKind={data.activeActionKind}
        icon={<RequestGroupIcon />}
        onAction={data.onAction}
      >
        {data.methodBreakdown || data.transactionName}
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-4 !w-4 !border-2 !border-emerald-300 !bg-white"
      />
    </>
  );
}
