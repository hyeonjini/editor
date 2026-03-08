"use client";

import { NodeActionDialog } from "@/features/edit-node";
import { EditLayout } from "@/widgets/edit-layout";
import { EditorCanvas } from "@/widgets/editor-canvas/ui/editor-canvas";
import { EditorControlPanel, MainContent } from "@/widgets/main-content";
import { TransactionSnb } from "@/widgets/transaction-snb";
import type { useEditPageController } from "@/views/edit/model/use-edit-page-controller";

type EditPageController = ReturnType<typeof useEditPageController>;

export type EditPageViewProps = Pick<
  EditPageController,
  | "editorState"
  | "currentScript"
  | "selectedTransactionId"
  | "selectedNodeId"
  | "activeNodeAction"
  | "activeLocatedNode"
  | "selectedTransactionConnections"
  | "transactionItems"
  | "canRunCurrentTransaction"
  | "canAddElement"
  | "harImportFeedback"
  | "handleTransactionSelect"
  | "handleTransactionRun"
  | "handleCurrentTransactionRun"
  | "handleStopSimulation"
  | "handleManualSave"
  | "handleLayoutChange"
  | "handleConnectionsChange"
  | "handleNodeSelect"
  | "handleNodeAction"
  | "handleCloseNodeAction"
  | "handleAddRequest"
  | "handleAddRequestGroup"
  | "handleAddData"
  | "handleImportHar"
  | "handleApplyEdit"
  | "handleApplyDataEdit"
  | "handleApplyGroupEdit"
  | "handleAddAfter"
>;

export function EditPageView({
  editorState,
  currentScript,
  selectedTransactionId,
  selectedNodeId,
  activeNodeAction,
  activeLocatedNode,
  selectedTransactionConnections,
  transactionItems,
  canRunCurrentTransaction,
  canAddElement,
  harImportFeedback,
  handleTransactionSelect,
  handleTransactionRun,
  handleCurrentTransactionRun,
  handleStopSimulation,
  handleManualSave,
  handleLayoutChange,
  handleConnectionsChange,
  handleNodeSelect,
  handleNodeAction,
  handleCloseNodeAction,
  handleAddRequest,
  handleAddRequestGroup,
  handleAddData,
  handleImportHar,
  handleApplyEdit,
  handleApplyDataEdit,
  handleApplyGroupEdit,
  handleAddAfter,
}: EditPageViewProps) {
  if (!currentScript) {
    return null;
  }

  return (
    <EditLayout
      sidebar={
        <TransactionSnb
          transactions={transactionItems}
          selectedTransactionId={selectedTransactionId}
          onSelectTransaction={handleTransactionSelect}
          onRunTransaction={handleTransactionRun}
        />
      }
    >
      <MainContent
        controlPanel={
          <EditorControlPanel
            isSaving={editorState.save.isSaving}
            canRun={canRunCurrentTransaction}
            canAddElement={canAddElement}
            canImportHar={canAddElement}
            onSave={handleManualSave}
            onRun={handleCurrentTransactionRun}
            onStop={handleStopSimulation}
            onAddRequest={handleAddRequest}
            onAddRequestGroup={handleAddRequestGroup}
            onAddData={handleAddData}
            onImportHar={handleImportHar}
          />
        }
      >
        {harImportFeedback ? (
          <div
            className={[
              "border-b px-4 py-3 text-sm",
              harImportFeedback.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : harImportFeedback.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800",
            ].join(" ")}
          >
            <p className="font-medium">{harImportFeedback.message}</p>
            {harImportFeedback.warnings.length > 0 ? (
              <p className="mt-1 text-xs opacity-80">{harImportFeedback.warnings.join(" ")}</p>
            ) : null}
          </div>
        ) : null}
        <EditorCanvas
          script={currentScript}
          selectedTransactionId={selectedTransactionId}
          executionState={editorState.execution}
          layout={editorState.view.layout}
          connections={selectedTransactionConnections}
          selectedNodeId={selectedNodeId}
          activeNodeAction={activeNodeAction}
          onLayoutChange={handleLayoutChange}
          onConnectionsChange={handleConnectionsChange}
          onNodeSelect={handleNodeSelect}
          onNodeAction={handleNodeAction}
        />
      </MainContent>
      <NodeActionDialog
        script={currentScript}
        action={activeNodeAction}
        node={activeLocatedNode}
        onClose={handleCloseNodeAction}
        onApplyEdit={handleApplyEdit}
        onApplyDataEdit={handleApplyDataEdit}
        onApplyGroupEdit={handleApplyGroupEdit}
        onAddAfter={handleAddAfter}
      />
    </EditLayout>
  );
}
