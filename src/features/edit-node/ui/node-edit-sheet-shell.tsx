"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

interface NodeEditSheetShellProps {
  open: boolean;
  nodeType: string;
  transactionName: string;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export function NodeEditSheetShell({
  open,
  nodeType,
  transactionName,
  title,
  description,
  onOpenChange,
  onClose,
  onSubmit,
  children,
}: NodeEditSheetShellProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/10 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(420px,100vw)] flex-col border-l border-slate-300 bg-white shadow-[-24px_0_48px_rgba(15,23,42,0.12)] outline-none">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {nodeType.toUpperCase()}
                </span>
                <span>{transactionName}</span>
              </div>
              <Dialog.Close className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                Close
              </Dialog.Close>
            </div>
            <Dialog.Title className="mt-3 text-lg font-semibold text-slate-950">{title}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              {description}
            </Dialog.Description>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">{children}</div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
