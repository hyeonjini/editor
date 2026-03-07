"use client";

import { Field, getInputClassName, SectionCard } from "@/features/edit-node/ui/node-edit-form-primitives";
import { NodeEditSheetShell } from "@/features/edit-node/ui/node-edit-sheet-shell";

interface DataNodeEditSheetProps {
  open: boolean;
  transactionName: string;
  title: string;
  name: string;
  description: string;
  dataType: string;
  dataValue: string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDataTypeChange: (value: string) => void;
  onDataValueChange: (value: string) => void;
}

export function DataNodeEditSheet({
  open,
  transactionName,
  title,
  name,
  description,
  dataType,
  dataValue,
  onOpenChange,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  onDataTypeChange,
  onDataValueChange,
}: DataNodeEditSheetProps) {
  return (
    <NodeEditSheetShell
      open={open}
      nodeType="data"
      transactionName={transactionName}
      title={title}
      description="Configure reusable values for later requests."
      onOpenChange={onOpenChange}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="space-y-4">
        <SectionCard title="Basics">
          <div className="space-y-4">
            <Field label="Node Name">
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

        <SectionCard title="Data Value">
          <div className="space-y-4">
            <Field label="Data Type">
              <select
                value={dataType}
                onChange={(event) => onDataTypeChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                {["string", "number", "boolean", "json", "array", "object"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Value">
              <textarea
                value={dataValue}
                onChange={(event) => onDataValueChange(event.target.value)}
                className="min-h-44 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none"
              />
            </Field>
          </div>
        </SectionCard>
      </div>
    </NodeEditSheetShell>
  );
}
