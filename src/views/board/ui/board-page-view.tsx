"use client";

import type { useBoardPageController } from "@/views/board/model/use-board-page-controller";
import { EditHeader, EditLayout } from "@/widgets/edit-layout";
import { BoardPostEditor } from "@/widgets/board-post-editor";
import { BoardPostList } from "@/widgets/board-post-list";

type BoardPageController = ReturnType<typeof useBoardPageController>;

export type BoardPageViewProps = Pick<
  BoardPageController,
  | "boardPageState"
  | "mode"
  | "draft"
  | "selectedPost"
  | "isMutating"
  | "handleSelectPost"
  | "handleStartCreate"
  | "handleDraftChange"
  | "handleSubmit"
  | "handleDelete"
>;

export function BoardPageView({
  boardPageState,
  mode,
  draft,
  selectedPost,
  isMutating,
  handleSelectPost,
  handleStartCreate,
  handleDraftChange,
  handleSubmit,
  handleDelete,
}: BoardPageViewProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col border border-slate-900 bg-white">
        <EditHeader appName="게시판 CRUD 예제" />
        <EditLayout
          sidebar={
            <BoardPostList
              posts={boardPageState.posts}
              selectedPostId={boardPageState.selectedPostId}
              onSelectPost={handleSelectPost}
              onStartCreate={handleStartCreate}
            />
          }
        >
          <BoardPostEditor
            mode={mode}
            draft={draft}
            isMutating={isMutating}
            selectedPostId={selectedPost?.id ?? null}
            notice={boardPageState.noticeMessage}
            error={boardPageState.errorMessage}
            onDraftChange={handleDraftChange}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </EditLayout>
      </div>
    </div>
  );
}
