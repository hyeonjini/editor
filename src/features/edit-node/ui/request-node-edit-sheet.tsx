"use client";

import type { HttpMethod } from "@/entities/script";
import { Field, FieldError, getInputClassName, SectionCard } from "@/features/edit-node/ui/node-edit-form-primitives";
import { NodeEditSheetShell } from "@/features/edit-node/ui/node-edit-sheet-shell";

interface RequestNodeEditSheetProps {
  open: boolean;
  transactionName: string;
  title: string;
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  requestErrorMessages: string[];
  requestVisibleErrors: {
    name?: string;
    url?: string;
    description?: string;
  };
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMethodChange: (value: HttpMethod) => void;
  onUrlChange: (value: string) => void;
  onRequestFieldBlur: (fieldName: "name" | "url" | "description") => void;
}

export function RequestNodeEditSheet({
  open,
  transactionName,
  title,
  name,
  description,
  method,
  url,
  requestErrorMessages,
  requestVisibleErrors,
  onOpenChange,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  onMethodChange,
  onUrlChange,
  onRequestFieldBlur,
}: RequestNodeEditSheetProps) {
  return (
    <NodeEditSheetShell
      open={open}
      nodeType="request"
      transactionName={transactionName}
      title={title}
      description="Configure the selected request node."
      onOpenChange={onOpenChange}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="space-y-4">
        {requestErrorMessages.length > 0 ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p className="font-semibold">Request form has validation errors.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
              {requestErrorMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <SectionCard title="Basics">
          <div className="space-y-4">
            <Field label="Node Name">
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                onBlur={() => onRequestFieldBlur("name")}
                aria-invalid={Boolean(requestVisibleErrors.name)}
                className={getInputClassName(Boolean(requestVisibleErrors.name))}
              />
              <FieldError message={requestVisibleErrors.name} />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                onBlur={() => onRequestFieldBlur("description")}
                aria-invalid={Boolean(requestVisibleErrors.description)}
                className={[getInputClassName(Boolean(requestVisibleErrors.description)), "min-h-24 resize-none"].join(" ")}
              />
              <FieldError message={requestVisibleErrors.description} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="HTTP Request">
          <div className="space-y-4">
            <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
              <Field label="Method">
                <select
                  value={method}
                  onChange={(event) => onMethodChange(event.target.value as HttpMethod)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="URL">
                <input
                  value={url}
                  onChange={(event) => onUrlChange(event.target.value)}
                  onBlur={() => onRequestFieldBlur("url")}
                  aria-invalid={Boolean(requestVisibleErrors.url)}
                  className={getInputClassName(Boolean(requestVisibleErrors.url))}
                />
                <FieldError message={requestVisibleErrors.url} />
              </Field>
            </div>
            <p className="text-xs text-slate-500">Use a path or absolute URL. Spaces are not allowed.</p>
          </div>
        </SectionCard>
      </div>
    </NodeEditSheetShell>
  );
}
