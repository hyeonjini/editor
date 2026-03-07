"use client";

import { Handle, Position } from "@xyflow/react";

import type { RequestFlowNodeProps } from "@/widgets/editor-canvas/model/flow-node-types";
import { NodeFrame, RequestNodeIcon } from "@/widgets/editor-canvas/ui/nodes/node-frame";

export function RequestFlowNode({ data }: RequestFlowNodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-4 !w-4 !border-2 !border-slate-300 !bg-white"
      />
      <NodeFrame
        nodeId={data.nodeId}
        title={data.label}
        subtitle={data.method}
        meta={data.urlPreview}
        tone="slate"
        status={data.executionStatus}
        isActive={data.isActive}
        isSelected={data.isSelected}
        isHovered={data.isHovered}
        activeActionKind={data.activeActionKind}
        icon={<RequestNodeIcon />}
        onAction={data.onAction}
      >
        {data.description ?? data.transactionName}
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-4 !w-4 !border-2 !border-slate-300 !bg-white"
      />
    </>
  );
}
