"use client";

import { startTransition, useEffect, useMemo, useReducer, useRef, useState } from "react";

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
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import { EditorCanvas } from "@/widgets/editor-canvas/ui/editor-canvas";
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
  const [target, setTarget] = useState<"browser" | "server">("browser");
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const autosaveUseCaseRef = useRef<AutosaveEditorDocumentUseCase | null>(null);

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
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff8ef,#f7fbff)] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-slate-500">Loading mock script...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff3c4,transparent_32%),radial-gradient(circle_at_top_right,#dbeafe,transparent_28%),linear-gradient(180deg,#fffdf8,#f8fafc)] px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Transactions</p>
          <div className="mt-5 space-y-3">
            {transactionList.map((transaction, index) => {
              const isSelected = selectedTransactionId === transaction.id;

              return (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: "editor/transaction-selected",
                      payload: { transactionId: transaction.id },
                    });
                  }}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                    Tx {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{transaction.name}</p>
                  <p className="mt-2 text-xs opacity-70">{transaction.steps.length} steps</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="grid min-h-[calc(100vh-2rem)] grid-rows-[auto_1fr] gap-4">
          <header className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Edit Page</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">{currentScript.name}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Domain model and React Flow view model are separated. This scaffold starts with manual node placement and mock execution.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span>Target</span>
                  <select
                    value={target}
                    onChange={(event) => {
                      setTarget(event.target.value as "browser" | "server");
                    }}
                    className="bg-transparent outline-none"
                  >
                    <option value="browser">browser</option>
                    <option value="server">server</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {editorState.save.isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Run Mock
                </button>
                <button
                  type="button"
                  onClick={handleStopSimulation}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Stop
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <StatusCard label="Execution" value={editorState.execution.status} />
              <StatusCard label="Target" value={editorState.execution.target ?? target} />
              <StatusCard
                label="Active Transaction"
                value={editorState.execution.activeTransactionId ?? selectedTransactionId ?? "none"}
              />
              <StatusCard
                label="Selected Node"
                value={selectedNodeId ?? editorState.execution.activeNodeId ?? "none"}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                Hovered: {hoveredNodeId ?? "none"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                Action: {activeNodeAction?.kind ?? "none"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                Saved: {editorState.save.lastSavedAt ?? "pending"}
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Hover a node to open `inspect`, `edit`, or `add-after` directly on the canvas. Edges can be created by dragging between node handles.
            </div>
          </header>

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
        </section>
      </div>
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
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
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
