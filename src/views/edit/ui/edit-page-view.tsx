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
            onSave={handleManualSave}
            onRun={handleCurrentTransactionRun}
            onStop={handleStopSimulation}
            onAddRequest={handleAddRequest}
            onAddRequestGroup={handleAddRequestGroup}
            onAddData={handleAddData}
          />
        }
      >
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
