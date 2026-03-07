"use client";

import { startTransition, useEffect, useMemo, useRef } from "react";

import type { DataNode, RequestGroupNode, RequestNode } from "@/entities/script";
import { LoadEditorDocumentUseCase } from "@/features/editor-document-load";
import {
  AutosaveEditorDocumentUseCase,
  SaveEditorDocumentUseCase,
} from "@/features/editor-document-save";
import {
  AddNodeToTransactionUseCase,
  createDefaultDataNode,
  createDefaultRequestGroupNode,
  createDefaultRequestNode,
  GetScriptNodeUseCase,
  InsertNodeAfterUseCase,
  RemoveScriptNodeUseCase,
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
import { buildTransactionSnbItems } from "@/widgets/transaction-snb/model/build-transaction-snb-items";
import { useEditorStore } from "@/views/edit/model/editor-store";

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
const removeScriptNodeUseCase = new RemoveScriptNodeUseCase();
const addNodeToTransactionUseCase = new AddNodeToTransactionUseCase();
const startSimulationUseCase = new StartSimulationUseCase(simulationRunnerFactory);
const stopSimulationUseCase = new StopSimulationUseCase(simulationRunnerFactory);
const subscribeSimulationUseCase = new SubscribeSimulationUseCase(simulationRunnerFactory);

export function useEditPageController() {
  const editorState = useEditorStore((state) => state.editorState);
  const resetEditorState = useEditorStore((state) => state.resetEditorState);
  const documentLoaded = useEditorStore((state) => state.documentLoaded);
  const scriptUpdated = useEditorStore((state) => state.scriptUpdated);
  const layoutChanged = useEditorStore((state) => state.layoutChanged);
  const transactionConnectionsChanged = useEditorStore((state) => state.transactionConnectionsChanged);
  const transactionSelected = useEditorStore((state) => state.transactionSelected);
  const nodeSelected = useEditorStore((state) => state.nodeSelected);
  const nodeActionOpened = useEditorStore((state) => state.nodeActionOpened);
  const nodeActionCleared = useEditorStore((state) => state.nodeActionCleared);
  const saveStarted = useEditorStore((state) => state.saveStarted);
  const saveSucceeded = useEditorStore((state) => state.saveSucceeded);
  const saveFailed = useEditorStore((state) => state.saveFailed);
  const executionEventReceived = useEditorStore((state) => state.executionEventReceived);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const autosaveUseCaseRef = useRef<AutosaveEditorDocumentUseCase | null>(null);
  const target = "browser" as const;

  const persistEditorDocument = async (document: EditorDocument) => {
    startTransition(() => {
      saveStarted();
    });

    try {
      const result = await saveEditorDocumentUseCase.execute(document);
      startTransition(() => {
        saveSucceeded(result.savedAt);
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save editor document";
      startTransition(() => {
        saveFailed(message);
      });
      throw error;
    }
  };

  if (!autosaveUseCaseRef.current) {
    autosaveUseCaseRef.current = new AutosaveEditorDocumentUseCase(persistEditorDocument, 900);
  }

  useEffect(() => {
    let disposed = false;
    resetEditorState();

    void loadEditorDocumentUseCase.execute("script_sample").then((document) => {
      if (disposed) {
        return;
      }

      startTransition(() => {
        documentLoaded(document);
      });
    });

    return () => {
      disposed = true;
      unsubscribeRef.current?.();
    };
  }, [documentLoaded, resetEditorState]);

  const currentScript = editorState.script;
  const transactionList = useMemo(() => currentScript?.transactions ?? [], [currentScript]);
  const selectedTransactionId = editorState.view.interaction.selectedTransactionId;
  const selectedNodeId = editorState.view.interaction.selectedNodeId;
  const activeNodeAction = editorState.view.interaction.activeNodeAction;

  const selectedTransaction = useMemo(
    () => transactionList.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactionList],
  );
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
  const transactionItems = useMemo(
    () => buildTransactionSnbItems(transactionList, editorState.execution.transactionStatuses),
    [editorState.execution.transactionStatuses, transactionList],
  );

  useEffect(() => {
    if (!currentDocument || !editorState.save.isDirty || editorState.save.isSaving) {
      return;
    }

    autosaveUseCaseRef.current?.schedule(currentDocument);
  }, [currentDocument, editorState.save.isDirty, editorState.save.isSaving]);

  const updateTransactionConnections = (
    transactionId: string | null,
    connections: FlowConnectionSnapshot[],
  ) => {
    if (!transactionId) {
      return;
    }

    transactionConnectionsChanged(transactionId, connections);
  };

  const handleScriptReplace = (nextScript: typeof editorState.script) => {
    if (!nextScript) {
      return;
    }

    scriptUpdated(nextScript);
  };

  const stopCurrentSessionIfNeeded = async () => {
    if (!editorState.execution.sessionId || !editorState.execution.target) {
      return;
    }

    await stopSimulationUseCase.execute(editorState.execution.target, editorState.execution.sessionId);
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  };

  const handleStartSimulation = async (transactionId: string) => {
    if (!currentScript) {
      return;
    }

    await stopCurrentSessionIfNeeded();

    const session = await startSimulationUseCase.execute({
      script: currentScript,
      target,
      scope: {
        kind: "transaction",
        transactionId,
      },
    });

    unsubscribeRef.current = subscribeSimulationUseCase.execute(target, session.sessionId, (event) => {
      startTransition(() => {
        executionEventReceived(event);
      });
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentScript) {
      return;
    }

    const nextScript = removeScriptNodeUseCase.execute(currentScript, nodeId);
    handleScriptReplace(nextScript);

    if (selectedTransactionId) {
      const existingConnections = editorState.view.connections[selectedTransactionId] ?? [];
      const nextConnections = removeConnectionsForNode(existingConnections, nodeId);
      updateTransactionConnections(selectedTransactionId, nextConnections);
    }

    nodeSelected(null);
    nodeActionCleared();
  };

  const handleAddNodeToCurrentTransaction = (kind: "request" | "request-group" | "data") => {
    if (!currentScript || !selectedTransactionId) {
      return;
    }

    const newNode =
      kind === "data"
        ? createDefaultDataNode()
        : kind === "request-group"
          ? createDefaultRequestGroupNode()
          : createDefaultRequestNode();

    const nextScript = addNodeToTransactionUseCase.execute(currentScript, selectedTransactionId, newNode);
    handleScriptReplace(nextScript);

    if (selectedTransaction) {
      const existingConnections = editorState.view.connections[selectedTransactionId] ?? [];
      const lastStep = selectedTransaction.steps[selectedTransaction.steps.length - 1] ?? null;
      const nextConnections = appendConnectionToTransactionEnd(existingConnections, lastStep?.id ?? null, newNode.id);
      updateTransactionConnections(selectedTransactionId, nextConnections);
    }

    nodeSelected(newNode.id);
    nodeActionOpened(newNode.id, "edit");
  };

  const handleCloseNodeAction = () => {
    nodeActionCleared();
  };

  const handleApplyEdit = (nextNode: RequestNode) => {
    if (!currentScript) {
      return;
    }

    const nextScript = replaceScriptNodeUseCase.execute(currentScript, nextNode.id, nextNode);
    handleScriptReplace(nextScript);
    handleCloseNodeAction();
  };

  const handleApplyDataEdit = (nextNode: DataNode) => {
    if (!currentScript) {
      return;
    }

    const nextScript = replaceScriptNodeUseCase.execute(currentScript, nextNode.id, nextNode);
    handleScriptReplace(nextScript);
    handleCloseNodeAction();
  };

  const handleApplyGroupEdit = (nextNode: RequestGroupNode) => {
    if (!currentScript) {
      return;
    }

    const nextScript = replaceScriptNodeUseCase.execute(currentScript, nextNode.id, nextNode);
    handleScriptReplace(nextScript);
    handleCloseNodeAction();
  };

  return {
    editorState,
    currentScript,
    selectedTransactionId,
    selectedNodeId,
    activeNodeAction,
    activeLocatedNode,
    selectedTransactionConnections,
    transactionItems,
    canRunCurrentTransaction: Boolean(selectedTransactionId),
    canAddElement: Boolean(selectedTransactionId),
    handleTransactionSelect: (transactionId: string) => {
      transactionSelected(transactionId);
    },
    handleTransactionRun: (transactionId: string) => {
      void handleStartSimulation(transactionId);
    },
    handleCurrentTransactionRun: () => {
      if (!selectedTransactionId) {
        return;
      }

      void handleStartSimulation(selectedTransactionId);
    },
    handleStopSimulation: () => {
      void stopCurrentSessionIfNeeded();
    },
    handleManualSave: () => {
      if (!currentDocument) {
        return;
      }

      void persistEditorDocument(currentDocument);
    },
    handleLayoutChange: (layout: typeof editorState.view.layout) => {
      layoutChanged(layout);
    },
    handleConnectionsChange: (connections: FlowConnectionSnapshot[]) => {
      updateTransactionConnections(selectedTransactionId, connections);
    },
    handleNodeSelect: (nodeId: string | null) => {
      nodeSelected(nodeId);
    },
    handleNodeAction: (nodeId: string, kind: "inspect" | "edit" | "add-after" | "delete") => {
      if (kind === "delete") {
        handleDeleteNode(nodeId);
        return;
      }

      nodeActionOpened(nodeId, kind);
    },
    handleCloseNodeAction,
    handleAddRequest: () => {
      handleAddNodeToCurrentTransaction("request");
    },
    handleAddRequestGroup: () => {
      handleAddNodeToCurrentTransaction("request-group");
    },
    handleAddData: () => {
      handleAddNodeToCurrentTransaction("data");
    },
    handleApplyEdit,
    handleApplyDataEdit,
    handleApplyGroupEdit,
    handleAddAfter: (newNode: DataNode | RequestNode | RequestGroupNode) => {
      if (!currentScript || !activeNodeAction) {
        return;
      }

      const nextScript = insertNodeAfterUseCase.execute(currentScript, activeNodeAction.nodeId, newNode);
      handleScriptReplace(nextScript);

      if (selectedTransactionId) {
        const existingConnections = editorState.view.connections[selectedTransactionId] ?? [];
        const updatedConnections = insertConnectionAfterNode(
          existingConnections,
          activeNodeAction.nodeId,
          newNode.id,
        );
        updateTransactionConnections(selectedTransactionId, updatedConnections);
      }

      nodeSelected(newNode.id);
      nodeActionCleared();
    },
  };
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

function removeConnectionsForNode(
  connections: FlowConnectionSnapshot[],
  nodeId: string,
): FlowConnectionSnapshot[] {
  const incoming = connections.filter((connection) => connection.target === nodeId);
  const outgoing = connections.filter((connection) => connection.source === nodeId);
  const unaffected = connections.filter(
    (connection) => connection.source !== nodeId && connection.target !== nodeId,
  );

  const bridgedConnections = incoming.flatMap((sourceConnection) =>
    outgoing
      .filter((targetConnection) => targetConnection.target !== sourceConnection.source)
      .map((targetConnection) => ({
        id: `manual:${sourceConnection.source}->${targetConnection.target}`,
        source: sourceConnection.source,
        target: targetConnection.target,
      })),
  );

  const dedupedConnections = new Map<string, FlowConnectionSnapshot>();

  [...unaffected, ...bridgedConnections].forEach((connection) => {
    dedupedConnections.set(`${connection.source}:${connection.target}`, connection);
  });

  return Array.from(dedupedConnections.values());
}

function appendConnectionToTransactionEnd(
  connections: FlowConnectionSnapshot[],
  previousNodeId: string | null,
  newNodeId: string,
): FlowConnectionSnapshot[] {
  if (!previousNodeId) {
    return connections;
  }

  const connectionKey = `${previousNodeId}:${newNodeId}`;
  const hasSameConnection = connections.some(
    (connection) => `${connection.source}:${connection.target}` === connectionKey,
  );

  if (hasSameConnection) {
    return connections;
  }

  return [
    ...connections,
    {
      id: `manual:${previousNodeId}->${newNodeId}`,
      source: previousNodeId,
      target: newNodeId,
    },
  ];
}
