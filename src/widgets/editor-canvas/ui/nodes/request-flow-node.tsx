"use client";

import { Handle, Position } from "@xyflow/react";

import type { RequestFlowNodeProps } from "@/widgets/editor-canvas/model/flow-node-types";
import { NodeFrame } from "@/widgets/editor-canvas/ui/nodes/node-frame";

export function RequestFlowNode({ data }: RequestFlowNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !bg-slate-500" />
      <NodeFrame
        nodeId={data.nodeId}
        title={data.label}
        subtitle={data.transactionName}
        meta={`${data.method} ${data.urlPreview}`}
        tone="slate"
        status={data.executionStatus}
        isActive={data.isActive}
        isSelected={data.isSelected}
        isHovered={data.isHovered}
        activeActionKind={data.activeActionKind}
        onAction={data.onAction}
      >
        {data.description ? <p className="mt-3 text-xs opacity-80">{data.description}</p> : null}
      </NodeFrame>
      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !bg-slate-500" />
    </>
  );
}
