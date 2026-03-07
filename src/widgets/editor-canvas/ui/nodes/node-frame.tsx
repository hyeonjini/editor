import type { PropsWithChildren } from "react";

type Tone = "amber" | "emerald" | "slate";

const toneClassName: Record<Tone, string> = {
  amber: "border-amber-300 bg-amber-50/90 text-amber-950",
  emerald: "border-emerald-300 bg-emerald-50/90 text-emerald-950",
  slate: "border-slate-300 bg-white/95 text-slate-950",
};

const badgeClassName = {
  idle: "bg-slate-200 text-slate-700",
  running: "bg-sky-200 text-sky-900",
  passed: "bg-emerald-200 text-emerald-900",
  failed: "bg-rose-200 text-rose-900",
};

interface NodeFrameProps extends PropsWithChildren {
  nodeId: string;
  title: string;
  subtitle: string;
  meta: string;
  tone: Tone;
  status: keyof typeof badgeClassName;
  isActive: boolean;
  isSelected: boolean;
  isHovered: boolean;
  activeActionKind: string | null;
  onAction?: (nodeId: string, kind: "inspect" | "edit" | "add-after") => void;
}

export function NodeFrame({
  nodeId,
  title,
  subtitle,
  meta,
  tone,
  status,
  isActive,
  isSelected,
  isHovered,
  activeActionKind,
  onAction,
  children,
}: NodeFrameProps) {
  return (
    <div
      className={[
        "min-w-[220px] rounded-2xl border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur",
        toneClassName[tone],
        isSelected ? "ring-2 ring-slate-950 ring-offset-2" : "",
        !isSelected && isActive ? "ring-2 ring-sky-400 ring-offset-2" : "",
        isHovered ? "translate-y-[-2px]" : "",
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">{subtitle}</p>
          <h3 className="mt-1 text-sm font-semibold">{title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${badgeClassName[status]}`}>
            {status}
          </span>
          {activeActionKind ? (
            <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase text-white">
              {activeActionKind}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-xs opacity-75">{meta}</div>
      {isHovered || isSelected ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-black/10 pt-3">
          <NodeActionButton
            label="Inspect"
            isActive={activeActionKind === "inspect"}
            onClick={() => onAction?.(nodeId, "inspect")}
          />
          <NodeActionButton
            label="Edit"
            isActive={activeActionKind === "edit"}
            onClick={() => onAction?.(nodeId, "edit")}
          />
          <NodeActionButton
            label="Add After"
            isActive={activeActionKind === "add-after"}
            onClick={() => onAction?.(nodeId, "add-after")}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function NodeActionButton({
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
          : "border-black/10 bg-white/80 text-slate-700 hover:bg-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
