"use client";

import { startTransition, useEffect, useMemo, useReducer, useRef } from "react";

import { LoadEditorDocumentUseCase } from "@/features/editor-document-load";
import {
  AutosaveEditorDocumentUseCase,
  SaveEditorDocumentUseCase,
} from "@/features/editor-document-save";
import {
  GetScriptNodeUseCase,
  InsertNodeAfterUseCase,
  NodeActionDialog,
  ReplaceScriptNodeUseCase,
} from "@/features/edit-node";
import {
  SimulationRunnerFactory,
  StartSimulationUseCase,
  StopSimulationUseCase,
  SubscribeSimulationUseCase,
} from "@/features/simulation-run";
import { MockBrowserSimulationRunner, MockScriptRepository, MockServerSimulationRunner } from "@/shared/infra";
import type { EditorDocument } from "@/shared/model/editor-document";
import { EditLayout } from "@/widgets/edit-layout";
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import { EditorCanvas } from "@/widgets/editor-canvas/ui/editor-canvas";
import { EditorControlPanel, MainContent } from "@/widgets/main-content";
import { TransactionSnb } from "@/widgets/transaction-snb";
import { createInitialEditorState } from "@/views/edit";
import { editorReducer } from "@/views/edit/model/editor-store";

const scriptRepository = new MockScriptRepository();
const simulationRunnerFactory = new SimulationRunnerFactory([
  new MockBrowserSimulationRunner(),
  new MockServerSimulationRunner(),
]);
const loadEditorDocumentUseCase = new LoadEditorDocumentUseCase(scriptRepository);
const saveEditorDocumentUseCase = new SaveEditorDocumentUseCase(scriptRepository);
const getScriptNodeUseCase = new GetScriptNodeUseCase();
const replaceScriptNodeUseCase = new ReplaceScriptNodeUseCase();
const insertNodeAfterUseCase = new InsertNodeAfterUseCase();
const startSimulationUseCase = new StartSimulationUseCase(simulationRunnerFactory);
const stopSimulationUseCase = new StopSimulationUseCase(simulationRunnerFactory);
const subscribeSimulationUseCase = new SubscribeSimulationUseCase(simulationRunnerFactory);

export function EditPage() {
  const [editorState, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const autosaveUseCaseRef = useRef<AutosaveEditorDocumentUseCase | null>(null);
  const target = "browser" as const;

  const persistEditorDocument = async (document: EditorDocument) => {
    startTransition(() => {
      dispatch({ type: "editor/save-started" });
    });

    try {
      const result = await saveEditorDocumentUseCase.execute(document);
      startTransition(() => {
        dispatch({
          type: "editor/save-succeeded",
          payload: { savedAt: result.savedAt },
        });
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save editor document";
      startTransition(() => {
        dispatch({
          type: "editor/save-failed",
          payload: { message },
        });
      });
      throw error;
    }
  };

  if (!autosaveUseCaseRef.current) {
    autosaveUseCaseRef.current = new AutosaveEditorDocumentUseCase(persistEditorDocument, 900);
  }

  useEffect(() => {
    let disposed = false;

    void loadEditorDocumentUseCase.execute("script_sample").then((document) => {
      if (disposed) {
        return;
      }

      startTransition(() => {
        dispatch({
          type: "editor/document-loaded",
          payload: document,
        });
      });
    });

    return () => {
      disposed = true;
      unsubscribeRef.current?.();
    };
  }, []);

  const transactionList = useMemo(() => editorState.script?.transactions ?? [], [editorState.script]);
  const currentScript = editorState.script;
  const selectedTransactionId = editorState.view.interaction.selectedTransactionId;
  const selectedNodeId = editorState.view.interaction.selectedNodeId;
  const hoveredNodeId = editorState.view.interaction.hoveredNodeId;
  const activeNodeAction = editorState.view.interaction.activeNodeAction;
  const activeLocatedNode = useMemo(() => {
    if (!currentScript || !activeNodeAction?.nodeId) {
      return null;
    }

    return getScriptNodeUseCase.execute(currentScript, activeNodeAction.nodeId);
  }, [activeNodeAction?.nodeId, currentScript]);
  const currentDocument = useMemo<EditorDocument | null>(() => {
    if (!currentScript) {
      return null;
    }

    return {
      script: currentScript,
      view: {
        layout: editorState.view.layout,
        connections: editorState.view.connections,
      },
    };
  }, [currentScript, editorState.view.connections, editorState.view.layout]);
  const selectedTransactionConnections = useMemo<FlowConnectionSnapshot[]>(() => {
    if (!selectedTransactionId) {
      return [];
    }

    return editorState.view.connections[selectedTransactionId] ?? [];
  }, [editorState.view.connections, selectedTransactionId]);

  useEffect(() => {
    if (!currentDocument || !editorState.save.isDirty || editorState.save.isSaving) {
      return;
    }

    autosaveUseCaseRef.current?.schedule(currentDocument);
  }, [currentDocument, editorState.save.isDirty, editorState.save.isSaving]);

  const handleStartSimulation = async () => {
    if (!currentScript) {
      return;
    }

    unsubscribeRef.current?.();

    const session = await startSimulationUseCase.execute({
      script: currentScript,
      target,
    });

    unsubscribeRef.current = subscribeSimulationUseCase.execute(target, session.sessionId, (event) => {
      startTransition(() => {
        dispatch({
          type: "editor/execution-event-received",
          payload: event,
        });
      });
    });
  };

  const handleStopSimulation = async () => {
    if (!editorState.execution.sessionId || !editorState.execution.target) {
      return;
    }

    await stopSimulationUseCase.execute(editorState.execution.target, editorState.execution.sessionId);
  };

  const handleManualSave = async () => {
    if (!currentDocument) {
      return;
    }

    await persistEditorDocument(currentDocument);
  };

  const handleCloseNodeAction = () => {
    dispatch({ type: "editor/node-action-cleared" });
  };

  const handleReplaceNode = (nextScript: typeof editorState.script) => {
    if (!nextScript) {
      return;
    }

    dispatch({
      type: "editor/script-updated",
      payload: nextScript,
    });
  };

  const updateTransactionConnections = (
    transactionId: string | null,
    connections: FlowConnectionSnapshot[],
  ) => {
    if (!transactionId) {
      return;
    }

    dispatch({
      type: "editor/transaction-connections-changed",
      payload: {
        transactionId,
        connections,
      },
    });
  };

  if (!currentScript) {
    return (
      <EditLayout
        sidebar={
          <div className="flex h-full items-center justify-center px-4 py-6 text-sm text-slate-500">
            Loading transactions...
          </div>
        }
      >
        <MainContent
          controlPanel={
            <EditorControlPanel isSaving={false} onSave={() => {}} onRun={() => {}} onStop={() => {}} />
          }
        >
          <div className="flex h-full min-h-[720px] items-center justify-center px-8 py-10 text-center text-sm text-slate-500">
            Node editor space is preparing the current script.
          </div>
        </MainContent>
      </EditLayout>
    );
  }

  return (
    <EditLayout
      sidebar={
        <TransactionSnb
          transactions={transactionList.map((transaction) => ({
            id: transaction.id,
            name: transaction.name,
            stepCount: transaction.steps.length,
          }))}
          selectedTransactionId={selectedTransactionId}
          onSelectTransaction={(transactionId) => {
            dispatch({
              type: "editor/transaction-selected",
              payload: { transactionId },
            });
          }}
        />
      }
    >
      <MainContent
        controlPanel={
          <EditorControlPanel
            isSaving={editorState.save.isSaving}
            onSave={handleManualSave}
            onRun={handleStartSimulation}
            onStop={handleStopSimulation}
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
            hoveredNodeId={hoveredNodeId}
            activeNodeAction={activeNodeAction}
            onLayoutChange={(layout) => {
              dispatch({
                type: "editor/layout-changed",
                payload: layout,
              });
            }}
            onConnectionsChange={(connections) => {
              updateTransactionConnections(selectedTransactionId, connections);
            }}
            onNodeSelect={(nodeId) => {
              dispatch({
                type: "editor/node-selected",
                payload: { nodeId },
              });
            }}
            onNodeHoverChange={(nodeId) => {
              dispatch({
                type: "editor/node-hovered",
                payload: { nodeId },
              });
            }}
            onNodeAction={(nodeId, kind) => {
              dispatch({
                type: "editor/node-action-opened",
                payload: { nodeId, kind },
              });
            }}
          />
      </MainContent>
      <NodeActionDialog
        script={currentScript}
        action={activeNodeAction}
        node={activeLocatedNode}
        onClose={handleCloseNodeAction}
        onApplyEdit={(nextNode) => {
          const nextScript = replaceScriptNodeUseCase.execute(
            currentScript,
            nextNode.id,
            nextNode,
          );

          handleReplaceNode(nextScript);
          handleCloseNodeAction();
        }}
        onApplyDataEdit={(nextNode) => {
          const nextScript = replaceScriptNodeUseCase.execute(
            currentScript,
            nextNode.id,
            nextNode,
          );

          handleReplaceNode(nextScript);
          handleCloseNodeAction();
        }}
        onApplyGroupEdit={(nextNode) => {
          const nextScript = replaceScriptNodeUseCase.execute(
            currentScript,
            nextNode.id,
            nextNode,
          );

          handleReplaceNode(nextScript);
          handleCloseNodeAction();
        }}
        onAddAfter={(newNode) => {
          if (!activeNodeAction) {
            return;
          }

          const nextScript = insertNodeAfterUseCase.execute(
            currentScript,
            activeNodeAction.nodeId,
            newNode,
          );

          handleReplaceNode(nextScript);
          if (selectedTransactionId) {
            const existingConnections = editorState.view.connections[selectedTransactionId] ?? [];
            const updatedConnections = insertConnectionAfterNode(
              existingConnections,
              activeNodeAction.nodeId,
              newNode.id,
            );
            updateTransactionConnections(selectedTransactionId, updatedConnections);
          }
          dispatch({
            type: "editor/node-selected",
            payload: { nodeId: newNode.id },
          });
          dispatch({ type: "editor/node-action-cleared" });
        }}
      />
    </EditLayout>
  );
}

function insertConnectionAfterNode(
  connections: FlowConnectionSnapshot[],
  targetNodeId: string,
  newNodeId: string,
): FlowConnectionSnapshot[] {
  const outgoingConnections = connections.filter((connection) => connection.source === targetNodeId);
  const unaffectedConnections = connections.filter((connection) => connection.source !== targetNodeId);

  const replacementConnections: FlowConnectionSnapshot[] = [
    {
      id: `manual:${targetNodeId}->${newNodeId}`,
      source: targetNodeId,
      target: newNodeId,
    },
    ...outgoingConnections.map((connection) => ({
      id: `manual:${newNodeId}->${connection.target}`,
      source: newNodeId,
      target: connection.target,
    })),
  ];

  if (outgoingConnections.length === 0) {
    return [
      ...connections,
      {
        id: `manual:${targetNodeId}->${newNodeId}`,
        source: targetNodeId,
        target: newNodeId,
      },
    ];
  }

  return [...unaffectedConnections, ...replacementConnections];
}
