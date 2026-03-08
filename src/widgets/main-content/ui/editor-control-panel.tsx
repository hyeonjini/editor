interface EditorControlPanelProps {
  isSaving: boolean;
  canRun: boolean;
  canAddElement: boolean;
  canImportHar: boolean;
  onSave: () => void;
  onRun: () => void;
  onStop: () => void;
  onAddRequest: () => void;
  onAddRequestGroup: () => void;
  onAddData: () => void;
  onImportHar: (file: File) => void;
}

export function EditorControlPanel({
  isSaving,
  canRun,
  canAddElement,
  canImportHar,
  onSave,
  onRun,
  onStop,
  onAddRequest,
  onAddRequestGroup,
  onAddData,
  onImportHar,
}: EditorControlPanelProps) {
  const inputId = "editor-control-panel-har-input";

  return (
    <section className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-900 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <ControlButton label="Add Request" onClick={onAddRequest} disabled={!canAddElement} />
        <ControlButton label="Add Group" onClick={onAddRequestGroup} disabled={!canAddElement} />
        <ControlButton label="Add Data" onClick={onAddData} disabled={!canAddElement} />
        <label
          htmlFor={inputId}
          className={[
            "rounded-sm border px-3 py-2 text-sm font-medium transition",
            canImportHar
              ? "cursor-pointer border-slate-900 text-slate-900 hover:bg-slate-100"
              : "cursor-not-allowed border-slate-900 text-slate-900 opacity-40",
          ].join(" ")}
        >
          Import HAR
        </label>
        <input
          id={inputId}
          type="file"
          accept=".har,application/json"
          disabled={!canImportHar}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onImportHar(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <ControlButton label={isSaving ? "Saving..." : "Save"} onClick={onSave} />
        <ControlButton label="Run Current" onClick={onRun} primary disabled={!canRun} />
        <ControlButton label="Stop" onClick={onStop} />
      </div>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  primary = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-sm border px-3 py-2 text-sm font-medium transition",
        primary ? "border-slate-900 bg-slate-900 text-white" : "border-slate-900 text-slate-900",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-100",
        primary && !disabled ? "hover:bg-slate-800" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
