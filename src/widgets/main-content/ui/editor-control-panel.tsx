interface EditorControlPanelProps {
  isSaving: boolean;
  onSave: () => void;
  onRun: () => void;
  onStop: () => void;
}

export function EditorControlPanel({
  isSaving,
  onSave,
  onRun,
  onStop,
}: EditorControlPanelProps) {
  return (
    <section className="flex shrink-0 items-center justify-end gap-2 border-b border-slate-900 bg-white px-4 py-3">
      <button
        type="button"
        onClick={onSave}
        className="rounded-sm border border-slate-900 px-3 py-2 text-sm font-medium text-slate-900"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onRun}
        className="rounded-sm border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        Run
      </button>
      <button
        type="button"
        onClick={onStop}
        className="rounded-sm border border-slate-900 px-3 py-2 text-sm font-medium text-slate-900"
      >
        Stop
      </button>
    </section>
  );
}
