"use client";

import { Field, getInputClassName, SectionCard } from "@/features/edit-node/ui/node-edit-form-primitives";
import { NodeEditSheetShell } from "@/features/edit-node/ui/node-edit-sheet-shell";

interface RequestGroupNodeEditSheetProps {
  open: boolean;
  transactionName: string;
  title: string;
  name: string;
  description: string;
  requestCount: number;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function RequestGroupNodeEditSheet({
  open,
  transactionName,
  title,
  name,
  description,
  requestCount,
  onOpenChange,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
}: RequestGroupNodeEditSheetProps) {
  return (
    <NodeEditSheetShell
      open={open}
      nodeType="request-group"
      transactionName={transactionName}
      title={title}
      description="Configure the request-group metadata and review contained requests."
      onOpenChange={onOpenChange}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="space-y-4">
        <SectionCard title="Basics">
          <div className="space-y-4">
            <Field label="Group Name">
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className={getInputClassName(false)}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className={[getInputClassName(false), "min-h-24 resize-none"].join(" ")}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Group Summary">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              This group currently contains {requestCount} request nodes.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              Child request editing is handled by selecting each request node directly from the canvas.
            </div>
          </div>
        </SectionCard>
      </div>
    </NodeEditSheetShell>
  );
}
