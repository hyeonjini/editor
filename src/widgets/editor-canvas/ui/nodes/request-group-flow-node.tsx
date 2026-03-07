"use client";

import { Handle, Position } from "@xyflow/react";

import type { RequestGroupFlowNodeProps } from "@/widgets/editor-canvas/model/flow-node-types";

export function RequestGroupFlowNode({ data }: RequestGroupFlowNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !bg-slate-500" />
      <div
        className={[
          "min-w-[250px] rounded-[28px] border border-dashed border-emerald-400 bg-emerald-50/85 p-4 shadow-[0_20px_40px_rgba(16,185,129,0.12)] backdrop-blur",
          data.isSelected ? "ring-2 ring-slate-950 ring-offset-2" : "",
          !data.isSelected && data.isActive ? "ring-2 ring-emerald-400 ring-offset-2" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/70">
              {data.transactionName}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-emerald-950">{data.label}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-emerald-200 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-900">
              {data.requestCount} req
            </span>
            {data.activeActionKind ? (
              <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                {data.activeActionKind}
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs text-emerald-900/70">
          Parallel request group summary.
        </p>
        <div className="mt-3 rounded-2xl bg-white/70 px-3 py-3 text-xs text-emerald-950">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">HTTP Requests</span>
            <span>{data.requestCount}</span>
          </div>
          <div className="mt-2 border-t border-emerald-200 pt-2 text-emerald-900/80">
            {data.methodBreakdown || "No requests"}
          </div>
        </div>
        {data.isHovered || data.isSelected ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-emerald-200 pt-3">
            <ActionButton
              label="Inspect"
              isActive={data.activeActionKind === "inspect"}
              onClick={() => data.onAction?.(data.nodeId, "inspect")}
            />
            <ActionButton
              label="Edit"
              isActive={data.activeActionKind === "edit"}
              onClick={() => data.onAction?.(data.nodeId, "edit")}
            />
            <ActionButton
              label="Add After"
              isActive={data.activeActionKind === "add-after"}
              onClick={() => data.onAction?.(data.nodeId, "add-after")}
            />
          </div>
        ) : null}
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !bg-slate-500" />
    </>
  );
}

function ActionButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        "rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition",
        isActive
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-emerald-200 bg-white/85 text-emerald-900 hover:bg-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
