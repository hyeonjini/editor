"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { DataNode, HttpMethod, RequestGroupNode, RequestNode, Script } from "@/entities/script";
import { validateRequestNodeEditDraft } from "@/features/edit-node/model/request-node-validation";
import {
  createDefaultDataNode,
  createDefaultRequestGroupNode,
  createDefaultRequestNode,
  type LocatedScriptNode,
} from "@/features/edit-node/model/script-node.helpers";
import { DataNodeEditSheet } from "@/features/edit-node/ui/data-node-edit-sheet";
import { RequestGroupNodeEditSheet } from "@/features/edit-node/ui/request-group-node-edit-sheet";
import { RequestNodeEditSheet } from "@/features/edit-node/ui/request-node-edit-sheet";
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

    setInsertType("request");
    setDidAttemptSubmit(false);
    setTouchedRequestFields({
      name: false,
      url: false,
      description: false,
    });
  }, [currentNode]);

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
    [
      currentNode?.type,
      didAttemptSubmit,
      requestValidation.errors.description,
      requestValidation.errors.name,
      requestValidation.errors.url,
      touchedRequestFields.description,
      touchedRequestFields.name,
      touchedRequestFields.url,
    ],
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

  if (actionKind === "edit") {
    const transactionName = getTransactionName(script, currentLocation.transactionIndex);
    const commonProps = {
      open: isOpen,
      transactionName,
      title: currentNode.name,
      onOpenChange: (open: boolean) => {
        if (!open) {
          onClose();
        }
      },
      onClose,
      onSubmit: handleEditSubmit,
    };

    if (currentNode.type === "request") {
      return (
        <RequestNodeEditSheet
          {...commonProps}
          name={name}
          description={description}
          method={method}
          url={url}
          requestErrorMessages={requestErrorMessages}
          requestVisibleErrors={requestVisibleErrors}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onRequestFieldBlur={(fieldName) => {
            markRequestFieldTouched(currentNode.type, fieldName, setTouchedRequestFields);
          }}
        />
      );
    }

    if (currentNode.type === "data") {
      return (
        <DataNodeEditSheet
          {...commonProps}
          name={name}
          description={description}
          dataType={dataType}
          dataValue={dataValue}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onDataTypeChange={setDataType}
          onDataValueChange={setDataValue}
        />
      );
    }

    return (
      <RequestGroupNodeEditSheet
        {...commonProps}
        name={name}
        description={description}
        requestCount={currentNode.requests.length}
        onNameChange={setName}
        onDescriptionChange={setDescription}
      />
    );
  }

  const titlePrefix = actionKind === "inspect" ? "Inspect" : "Add After";

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
              onClick={handleAddAfter}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Insert Node
            </button>
          </>
        )
      }
    >
      {actionKind === "inspect" ? (
        <pre className="max-h-[55vh] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {JSON.stringify(currentNode, null, 2)}
        </pre>
      ) : (
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
      )}
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
