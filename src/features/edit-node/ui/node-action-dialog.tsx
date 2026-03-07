"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { DataNode, HttpMethod, RequestGroupNode, RequestNode, Script } from "@/entities/script";
import {
  createDefaultDataNode,
  createDefaultRequestGroupNode,
  createDefaultRequestNode,
  type LocatedScriptNode,
  validateRequestNodeEditDraft,
} from "@/features/edit-node";
import { AppDialog } from "@/shared/ui";
import type { EditorNodeActionState } from "@/views/edit/model/editor-view-state";

interface NodeActionDialogProps {
  script: Script;
  action: EditorNodeActionState | null;
  node: LocatedScriptNode | null;
  onClose: () => void;
  onApplyEdit: (nextNode: RequestNode) => void;
  onApplyDataEdit: (nextNode: DataNode) => void;
  onApplyGroupEdit: (nextNode: RequestGroupNode) => void;
  onAddAfter: (newNode: DataNode | RequestNode | RequestGroupNode) => void;
}

type InsertableNodeType = "data" | "request" | "request-group";
type RequestFieldName = "name" | "url" | "description";

export function NodeActionDialog({
  script,
  action,
  node,
  onClose,
  onApplyEdit,
  onApplyDataEdit,
  onApplyGroupEdit,
  onAddAfter,
}: NodeActionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("/api/resource");
  const [dataType, setDataType] = useState("string");
  const [dataValue, setDataValue] = useState("");
  const [insertType, setInsertType] = useState<InsertableNodeType>("request");
  const [touchedRequestFields, setTouchedRequestFields] = useState<Record<RequestFieldName, boolean>>({
    name: false,
    url: false,
    description: false,
  });
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);

  const isOpen = Boolean(action && node);
  const actionKind = action?.kind ?? null;
  const currentNode = node?.node ?? null;
  const currentLocation = node;
  const requestValidation = useMemo(
    () =>
      validateRequestNodeEditDraft({
        name,
        method,
        url,
        description,
      }),
    [description, method, name, url],
  );

  useEffect(() => {
    if (!currentNode) {
      return;
    }

    setName(currentNode.name);
    setDescription(currentNode.description ?? "");

    if (currentNode.type === "request") {
      setMethod(currentNode.method);
      setUrl(
        currentNode.url.kind === "static"
          ? currentNode.url.value
          : currentNode.url.kind === "template"
            ? currentNode.url.template
            : currentNode.url.selector.path,
      );
    }

    if (currentNode.type === "data") {
      setDataType(currentNode.dataType);
      setDataValue(
        typeof currentNode.value === "string"
          ? currentNode.value
          : JSON.stringify(currentNode.value, null, 2),
      );
    }

    if (node?.container === "group-request") {
      setInsertType("request");
    } else {
      setInsertType("request");
    }

    setDidAttemptSubmit(false);
    setTouchedRequestFields({
      name: false,
      url: false,
      description: false,
    });
  }, [currentNode, node?.container]);

  const insertableTypes = useMemo<InsertableNodeType[]>(
    () => (node?.container === "group-request" ? ["request"] : ["data", "request", "request-group"]),
    [node?.container],
  );
  const requestVisibleErrors = useMemo(
    () => ({
      name:
        (didAttemptSubmit || touchedRequestFields.name) && currentNode?.type === "request"
          ? requestValidation.errors.name
          : undefined,
      url:
        (didAttemptSubmit || touchedRequestFields.url) && currentNode?.type === "request"
          ? requestValidation.errors.url
          : undefined,
      description:
        (didAttemptSubmit || touchedRequestFields.description) && currentNode?.type === "request"
          ? requestValidation.errors.description
          : undefined,
    }),
    [currentNode?.type, didAttemptSubmit, requestValidation.errors.description, requestValidation.errors.name, requestValidation.errors.url, touchedRequestFields.description, touchedRequestFields.name, touchedRequestFields.url],
  );
  const requestErrorMessages = useMemo(
    () => Object.values(requestVisibleErrors).filter((value): value is string => Boolean(value)),
    [requestVisibleErrors],
  );

  const handleEditSubmit = () => {
    if (!currentNode) {
      return;
    }

    if (currentNode.type === "request") {
      setDidAttemptSubmit(true);
      if (!requestValidation.isValid) {
        return;
      }

      onApplyEdit({
        ...currentNode,
        name: name.trim(),
        description: description.trim() || undefined,
        method,
        url: {
          kind: "static",
          value: url.trim(),
        },
      });
      return;
    }

    if (currentNode.type === "data") {
      onApplyDataEdit({
        ...currentNode,
        name,
        description: description || undefined,
        dataType: dataType as typeof currentNode.dataType,
        value: parseDataValue(dataType, dataValue),
      });
      return;
    }

    onApplyGroupEdit({
      ...currentNode,
      name,
      description: description || undefined,
    });
  };

  const handleAddAfter = () => {
    const newNode =
      insertType === "data"
        ? createDefaultDataNode()
        : insertType === "request-group"
          ? createDefaultRequestGroupNode()
          : createDefaultRequestNode();

    onAddAfter(newNode);
  };

  if (!isOpen || !currentNode || !actionKind || !currentLocation) {
    return null;
  }

  const titlePrefix = actionKind === "inspect" ? "Inspect" : actionKind === "edit" ? "Edit" : "Add After";

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={`${titlePrefix} ${currentNode.name}`}
      description={`Current node type: ${currentNode.type}. Transaction scope: ${getTransactionName(script, currentLocation.transactionIndex)}`}
      footer={
        actionKind === "inspect" ? null : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={actionKind === "edit" ? handleEditSubmit : handleAddAfter}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition"
            >
              {actionKind === "edit" ? "Apply Changes" : "Insert Node"}
            </button>
          </>
        )
      }
    >
      {actionKind === "inspect" ? (
        <pre className="max-h-[55vh] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {JSON.stringify(currentNode, null, 2)}
        </pre>
      ) : null}

      {actionKind === "edit" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {currentNode.type === "request" && requestErrorMessages.length > 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="font-semibold">Request form has validation errors.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                {requestErrorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Field label="Node Name">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => markRequestFieldTouched(currentNode.type, "name", setTouchedRequestFields)}
              aria-invalid={Boolean(requestVisibleErrors.name)}
              className={getInputClassName(Boolean(requestVisibleErrors.name))}
            />
            <FieldError message={requestVisibleErrors.name} />
          </Field>
          <Field label="Description">
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => markRequestFieldTouched(currentNode.type, "description", setTouchedRequestFields)}
              aria-invalid={Boolean(requestVisibleErrors.description)}
              className={getInputClassName(Boolean(requestVisibleErrors.description))}
            />
            <FieldError message={requestVisibleErrors.description} />
          </Field>
          {currentNode.type === "request" ? (
            <>
              <Field label="Method">
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value as HttpMethod)}
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
                  onChange={(event) => setUrl(event.target.value)}
                  onBlur={() => markRequestFieldTouched(currentNode.type, "url", setTouchedRequestFields)}
                  aria-invalid={Boolean(requestVisibleErrors.url)}
                  className={getInputClassName(Boolean(requestVisibleErrors.url))}
                />
                <FieldHint>Use a path or absolute URL. Spaces are not allowed.</FieldHint>
                <FieldError message={requestVisibleErrors.url} />
              </Field>
            </>
          ) : null}
          {currentNode.type === "data" ? (
            <>
              <Field label="Data Type">
                <select
                  value={dataType}
                  onChange={(event) => setDataType(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {["string", "number", "boolean", "json", "array", "object"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Value" className="md:col-span-2">
                <textarea
                  value={dataValue}
                  onChange={(event) => setDataValue(event.target.value)}
                  className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none"
                />
              </Field>
            </>
          ) : null}
          {currentNode.type === "request-group" ? (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              This group currently contains {currentNode.requests.length} request nodes. Child request editing is handled by selecting individual request nodes.
            </div>
          ) : null}
        </div>
      ) : null}

      {actionKind === "add-after" ? (
        <div className="grid gap-4">
          <Field label="Insert Node Type">
            <select
              value={insertType}
              onChange={(event) => setInsertType(event.target.value as InsertableNodeType)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              {insertableTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            {currentLocation.container === "group-request"
              ? "Requests inside a request-group can only be followed by another request."
              : "Top-level transaction flow can insert a data node, request, or request-group."}
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
}

function parseDataValue(dataType: string, rawValue: string): unknown {
  if (dataType === "number") {
    return Number(rawValue);
  }

  if (dataType === "boolean") {
    return rawValue.trim().toLowerCase() === "true";
  }

  if (dataType === "json" || dataType === "array" || dataType === "object") {
    try {
      return JSON.parse(rawValue);
    } catch {
      return rawValue;
    }
  }

  return rawValue;
}

function getTransactionName(script: Script, transactionIndex: number): string {
  return script.transactions[transactionIndex]?.name ?? "Unknown transaction";
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-slate-500">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>;
}

function getInputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border px-4 py-3 outline-none transition",
    hasError
      ? "border-rose-300 bg-rose-50 text-rose-950 focus:border-rose-500"
      : "border-slate-200 bg-white text-slate-950 focus:border-slate-400",
  ].join(" ");
}

function markRequestFieldTouched(
  nodeType: DataNode["type"] | RequestNode["type"] | RequestGroupNode["type"],
  fieldName: RequestFieldName,
  setTouchedRequestFields: Dispatch<SetStateAction<Record<RequestFieldName, boolean>>>,
) {
  if (nodeType !== "request") {
    return;
  }

  setTouchedRequestFields((current) => (current[fieldName] ? current : { ...current, [fieldName]: true }));
}
