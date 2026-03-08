import type { CreateBoardPostInput, BoardPostStatus } from "@/entities/board-post";

export interface BoardPostDraft extends CreateBoardPostInput {}

interface BoardPostEditorProps {
  mode: "create" | "edit";
  draft: BoardPostDraft;
  isMutating: boolean;
  selectedPostId: string | null;
  notice: string | null;
  error: string | null;
  onDraftChange: (patch: Partial<BoardPostDraft>) => void;
  onSubmit: () => void;
  onDelete: () => void;
}

export function BoardPostEditor({
  mode,
  draft,
  isMutating,
  selectedPostId,
  notice,
  error,
  onDraftChange,
  onSubmit,
  onDelete,
}: BoardPostEditorProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-50">
      <div className="border-b border-slate-900 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-slate-950">
          {mode === "create" ? "새 게시글 작성" : "게시글 편집"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          controller와 store를 통해 repository/use case 기반 CRUD가 동작합니다.
        </p>
      </div>
      {notice ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{notice}</div>
      ) : null}
      {error ? (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-800">{error}</div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-5">
          <Field label="제목">
            <input
              value={draft.title}
              onChange={(event) => {
                onDraftChange({ title: event.target.value });
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="작성자">
              <input
                value={draft.author}
                onChange={(event) => {
                  onDraftChange({ author: event.target.value });
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </Field>
            <Field label="상태">
              <select
                value={draft.status}
                onChange={(event) => {
                  onDraftChange({ status: event.target.value as BoardPostStatus });
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </Field>
          </div>
          <Field label="본문">
            <textarea
              value={draft.content}
              onChange={(event) => {
                onDraftChange({ content: event.target.value });
              }}
              className="min-h-[320px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </Field>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-900 bg-white px-5 py-4">
        <div className="text-xs text-slate-500">
          {mode === "edit" && selectedPostId ? `Selected: ${selectedPostId}` : "새 게시글 작성 중"}
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isMutating}
              className="rounded-sm border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isMutating}
            className="rounded-sm border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMutating ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
