import { applyExecutionEventToState } from "@/entities/execution";
import type { Script } from "@/entities/script";
import { normalizeConnections } from "@/widgets/editor-canvas";
import type { EditorAction } from "@/views/edit/model/editor-actions";
import type { EditorState } from "@/views/edit/model/editor-state";
import { createEditorStateFromDocument, createInitialEditorState } from "@/views/edit/model/editor-state";

const getDefaultTransactionId = (state: EditorState): string | null => {
  return state.script?.transactions[0]?.id ?? null;
};

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

export const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
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
        view: {
          ...state.view,
          interaction: {
            ...state.view.interaction,
            selectedTransactionId:
              nextExecution.activeTransactionId ??
              state.view.interaction.selectedTransactionId ??
              getDefaultTransactionId(state),
            selectedNodeId: nextExecution.activeNodeId ?? state.view.interaction.selectedNodeId,
          },
        },
      };
    }
    default:
      return state;
  }
};

export const createEditorStoreState = (): EditorState => createInitialEditorState();
