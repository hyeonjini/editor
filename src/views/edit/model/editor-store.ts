import { create } from "zustand";

import { applyExecutionEventToState } from "@/entities/execution";
import type { Script } from "@/entities/script";
import type { EditorDocument } from "@/shared/model/editor-document";
import { normalizeConnections } from "@/widgets/editor-canvas";
import type { EditorAction } from "@/views/edit/model/editor-actions";
import type { EditorState } from "@/views/edit/model/editor-state";
import { createEditorStateFromDocument, createInitialEditorState } from "@/views/edit/model/editor-state";
import type { EditorNodeActionKind } from "@/views/edit/model/editor-view-state";
import type { ExecutionEvent } from "@/entities/execution";
import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";

const findTransactionIdByNode = (script: Script | null, nodeId: string | null): string | null => {
  if (!script || !nodeId) {
    return null;
  }

  for (const transaction of script.transactions) {
    for (const step of transaction.steps) {
      if (step.id === nodeId) {
        return transaction.id;
      }

      if (step.type === "request-group" && step.requests.some((request) => request.id === nodeId)) {
        return transaction.id;
      }
    }
  }

  return null;
};

export const reduceEditorState = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case "editor/document-loaded":
      return {
        ...state,
        ...createEditorStateFromDocument(action.payload),
        save: {
          ...state.save,
          isDirty: false,
          isSaving: false,
          lastError: null,
        },
      };
    case "editor/script-updated":
      return {
        ...state,
        script: action.payload,
        view: {
          ...state.view,
          connections: normalizeConnections(action.payload, state.view.connections),
          interaction: {
            ...state.view.interaction,
            selectedTransactionId:
              state.view.interaction.selectedTransactionId ?? action.payload.transactions[0]?.id ?? null,
          },
        },
        save: {
          ...state.save,
          isDirty: true,
        },
      };
    case "editor/transaction-connections-changed":
      return {
        ...state,
        view: {
          ...state.view,
          connections: {
            ...state.view.connections,
            [action.payload.transactionId]: action.payload.connections,
          },
        },
        save: {
          ...state.save,
          isDirty: true,
        },
      };
    case "editor/layout-changed":
      return {
        ...state,
        view: {
          ...state.view,
          layout: action.payload,
        },
        save: {
          ...state.save,
          isDirty: true,
        },
      };
    case "editor/transaction-selected":
      return {
        ...state,
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            selectedTransactionId: action.payload.transactionId,
            selectedNodeId: null,
            activeNodeAction: null,
          },
        },
      };
    case "editor/node-selected":
      return {
        ...state,
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            selectedNodeId: action.payload.nodeId,
            selectedTransactionId:
              findTransactionIdByNode(state.script, action.payload.nodeId) ??
              state.view.interaction.selectedTransactionId,
            activeNodeAction:
              action.payload.nodeId && state.view.interaction.activeNodeAction?.nodeId === action.payload.nodeId
                ? state.view.interaction.activeNodeAction
                : null,
          },
        },
      };
    case "editor/node-hovered":
      return {
        ...state,
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            hoveredNodeId: action.payload.nodeId,
          },
        },
      };
    case "editor/node-action-opened":
      return {
        ...state,
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            selectedNodeId: action.payload.nodeId,
            selectedTransactionId:
              findTransactionIdByNode(state.script, action.payload.nodeId) ??
              state.view.interaction.selectedTransactionId,
            activeNodeAction: action.payload,
          },
        },
      };
    case "editor/node-action-cleared":
      return {
        ...state,
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            activeNodeAction: null,
          },
        },
      };
    case "editor/save-started":
      return {
        ...state,
        save: {
          ...state.save,
          isSaving: true,
          lastError: null,
        },
      };
    case "editor/save-succeeded":
      return {
        ...state,
        save: {
          ...state.save,
          isSaving: false,
          isDirty: false,
          lastSavedAt: action.payload.savedAt,
          lastError: null,
        },
      };
    case "editor/save-failed":
      return {
        ...state,
        save: {
          ...state.save,
          isSaving: false,
          lastError: action.payload.message,
        },
      };
    case "editor/execution-event-received": {
      const nextExecution = applyExecutionEventToState(state.execution, action.payload);

      return {
        ...state,
        execution: nextExecution,
      };
    }
    default:
      return state;
  }
};

export const createEditorStoreState = (): EditorState => createInitialEditorState();

interface EditorStore {
  editorState: EditorState;
  resetEditorState: () => void;
  dispatchEditorAction: (action: EditorAction) => void;
  documentLoaded: (document: EditorDocument) => void;
  scriptUpdated: (script: Script) => void;
  layoutChanged: (layout: FlowLayoutSnapshot) => void;
  transactionConnectionsChanged: (transactionId: string, connections: FlowConnectionSnapshot[]) => void;
  transactionSelected: (transactionId: string | null) => void;
  nodeSelected: (nodeId: string | null) => void;
  nodeHovered: (nodeId: string | null) => void;
  nodeActionOpened: (nodeId: string, kind: EditorNodeActionKind) => void;
  nodeActionCleared: () => void;
  saveStarted: () => void;
  saveSucceeded: (savedAt: string) => void;
  saveFailed: (message: string) => void;
  executionEventReceived: (event: ExecutionEvent) => void;
}

const applyActionToStoreState = (state: EditorState, action: EditorAction) => reduceEditorState(state, action);

export const useEditorStore = create<EditorStore>()((set) => ({
  editorState: createEditorStoreState(),
  resetEditorState: () => {
    set({ editorState: createEditorStoreState() });
  },
  dispatchEditorAction: (action) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, action),
    }));
  },
  documentLoaded: (document) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/document-loaded",
        payload: document,
      }),
    }));
  },
  scriptUpdated: (script) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/script-updated",
        payload: script,
      }),
    }));
  },
  layoutChanged: (layout) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/layout-changed",
        payload: layout,
      }),
    }));
  },
  transactionConnectionsChanged: (transactionId, connections) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/transaction-connections-changed",
        payload: {
          transactionId,
          connections,
        },
      }),
    }));
  },
  transactionSelected: (transactionId) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/transaction-selected",
        payload: { transactionId },
      }),
    }));
  },
  nodeSelected: (nodeId) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/node-selected",
        payload: { nodeId },
      }),
    }));
  },
  nodeHovered: (nodeId) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/node-hovered",
        payload: { nodeId },
      }),
    }));
  },
  nodeActionOpened: (nodeId, kind) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/node-action-opened",
        payload: { nodeId, kind },
      }),
    }));
  },
  nodeActionCleared: () => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/node-action-cleared",
      }),
    }));
  },
  saveStarted: () => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/save-started",
      }),
    }));
  },
  saveSucceeded: (savedAt) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/save-succeeded",
        payload: { savedAt },
      }),
    }));
  },
  saveFailed: (message) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/save-failed",
        payload: { message },
      }),
    }));
  },
  executionEventReceived: (event) => {
    set((state) => ({
      editorState: applyActionToStoreState(state.editorState, {
        type: "editor/execution-event-received",
        payload: event,
      }),
    }));
  },
}));
