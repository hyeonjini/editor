import type { PropsWithChildren, ReactNode } from "react";

type Tone = "amber" | "emerald" | "slate";
type ActionKind = "inspect" | "edit" | "add-after" | "delete";

const cardToneClassName: Record<Tone, string> = {
  amber: "border-amber-300 bg-amber-50/95 text-amber-950",
  emerald: "border-emerald-300 bg-emerald-50/95 text-emerald-950",
  slate: "border-slate-300 bg-white text-slate-950",
};

const iconToneClassName: Record<Tone, string> = {
  amber: "border-amber-200 bg-white text-amber-500",
  emerald: "border-emerald-200 bg-white text-emerald-500",
  slate: "border-slate-200 bg-white text-indigo-500",
};

interface NodeFrameProps extends PropsWithChildren {
  nodeId: string;
  title: string;
  subtitle: string;
  meta?: string;
  tone: Tone;
  status: "idle" | "running" | "passed" | "failed";
  isActive: boolean;
  isSelected: boolean;
  isHovered: boolean;
  activeActionKind: string | null;
  icon: ReactNode;
  onAction?: (nodeId: string, kind: ActionKind) => void;
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
  icon,
  onAction,
  children,
}: NodeFrameProps) {
  const isToolbarVisible = isSelected || isHovered || activeActionKind !== null;

  return (
    <div className="group relative w-[172px] overflow-visible px-2 py-10">
      <div
        className={[
          "pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-xl border border-slate-300 bg-white/96 p-1 shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
          isToolbarVisible ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <ToolbarButton
          label="Preview"
          onClick={() => onAction?.(nodeId, "inspect")}
          icon={<PlayIcon />}
        />
        <ToolbarButton
          label="Settings"
          onClick={() => onAction?.(nodeId, "edit")}
          icon={<PowerIcon />}
        />
        <ToolbarButton
          label="Delete"
          onClick={() => onAction?.(nodeId, "delete")}
          icon={<TrashIcon />}
        />
        <ToolbarButton
          label="Add After"
          onClick={() => onAction?.(nodeId, "add-after")}
          icon={<DotsIcon />}
        />
      </div>

      <div
        className={[
          "relative rounded-[26px] border px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition",
          cardToneClassName[tone],
          isSelected ? "ring-2 ring-slate-900 ring-offset-2" : "",
          !isSelected && isActive ? "ring-2 ring-sky-400 ring-offset-2" : "",
        ].join(" ")}
      >
        <div
          className={[
            "relative mx-auto flex h-24 w-24 items-center justify-center rounded-[18px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
            iconToneClassName[tone],
          ].join(" ")}
        >
          {icon}
          <StatusBadge status={status} />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{title}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{subtitle}</p>
          {meta ? <p className="mt-2 text-xs text-slate-500">{meta}</p> : null}
        </div>
        {children ? <div className="mt-3 text-center text-xs text-slate-600">{children}</div> : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: NodeFrameProps["status"] }) {
  if (status === "failed") {
    return (
      <span className="absolute bottom-2 right-2 text-rose-500">
        <AlertIcon />
      </span>
    );
  }

  if (status === "running") {
    return (
      <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.15)]" />
    );
  }

  if (status === "passed") {
    return (
      <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
    );
  }

  return null;
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
    >
      {icon}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M4 2.7v10.6c0 .5.5.8.9.5l7-5.3a.6.6 0 0 0 0-1L4.9 2.2a.6.6 0 0 0-.9.5Z" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-[1.7]" aria-hidden="true">
      <path d="M8 1.8v5.1" strokeLinecap="round" />
      <path d="M4.4 3.8A5.6 5.6 0 1 0 11.6 3.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M6 2.5h4l.5 1H13v1.4h-1l-.5 7.4A1.2 1.2 0 0 1 10.3 13H5.7a1.2 1.2 0 0 1-1.2-1.1L4 4.9H3V3.5h2.5l.5-1Zm1.1 0-.2.4h2.2l-.2-.4H7.1ZM6.2 6.2h1.1v4.7H6.2V6.2Zm2.5 0h1.1v4.7H8.7V6.2Z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
      <circle cx="3.5" cy="8" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="12.5" cy="8" r="1.2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M7.1 2.6a1 1 0 0 1 1.8 0l5 9.3a1 1 0 0 1-.9 1.5H3a1 1 0 0 1-.9-1.5l5-9.3Zm.9 3.1a.7.7 0 0 0-.7.8l.2 2.8a.5.5 0 0 0 1 0l.2-2.8a.7.7 0 0 0-.7-.8Zm0 5.8a.8.8 0 1 0 0-1.7.8.8 0 0 0 0 1.7Z" />
    </svg>
  );
}

export function RequestNodeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 fill-none stroke-current stroke-[2]" aria-hidden="true">
      <circle cx="20" cy="20" r="12" />
      <path d="M8 20h24M20 8a19 19 0 0 1 0 24M20 8a19 19 0 0 0 0 24M11 13.5c2.2 1.4 5.5 2.2 9 2.2s6.8-.8 9-2.2M11 26.5c2.2-1.4 5.5-2.2 9-2.2s6.8.8 9 2.2" />
    </svg>
  );
}

export function DataNodeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 fill-none stroke-current stroke-[2]" aria-hidden="true">
      <ellipse cx="20" cy="10" rx="10" ry="4.5" />
      <path d="M10 10v12c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5V10" />
      <path d="M10 16.5c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5" />
    </svg>
  );
}

export function RequestGroupIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 fill-none stroke-current stroke-[2]" aria-hidden="true">
      <rect x="7" y="10" width="10" height="10" rx="2" />
      <rect x="23" y="10" width="10" height="10" rx="2" />
      <rect x="15" y="22" width="10" height="10" rx="2" />
      <path d="M12 20v2M28 20v2M20 20v2" strokeLinecap="round" />
    </svg>
  );
}
