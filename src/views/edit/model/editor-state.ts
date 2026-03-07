import type { ExecutionState } from "@/entities/execution";
import { createInitialExecutionState } from "@/entities/execution";
import type { EditorDocument } from "@/shared/model/editor-document";
import { normalizeConnections } from "@/widgets/editor-canvas";
import type { EditorViewState } from "@/views/edit/model/editor-view-state";
import { createInitialEditorViewState } from "@/views/edit/model/editor-view-state";

export interface EditorSaveState {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  lastError: string | null;
}

export interface EditorState {
  script: EditorDocument["script"] | null;
  view: EditorViewState;
  execution: ExecutionState;
  save: EditorSaveState;
}

export const createInitialEditorState = (): EditorState => ({
  script: null,
  view: createInitialEditorViewState(),
  execution: createInitialExecutionState(),
  save: {
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    lastError: null,
  },
});

export const createEditorStateFromDocument = (document: EditorDocument): EditorState => ({
  ...createInitialEditorState(),
  script: document.script,
  view: {
    ...createInitialEditorViewState(
      document.view.layout,
      normalizeConnections(document.script, document.view.connections),
    ),
    interaction: {
      ...createInitialEditorViewState(
        document.view.layout,
        normalizeConnections(document.script, document.view.connections),
      ).interaction,
      selectedTransactionId: document.script.transactions[0]?.id ?? null,
    },
  },
});
