"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import type { BoardPost, CreateBoardPostInput } from "@/entities/board-post";
import {
  CreateBoardPostUseCase,
  DeleteBoardPostUseCase,
  ListBoardPostsUseCase,
  UpdateBoardPostUseCase,
} from "@/features/board-post-crud";
import { createBoardPostRepository } from "@/shared/infra";
import type { BoardPostDraft } from "@/widgets/board-post-editor";
import { useBoardPageStore } from "@/views/board/model/board-page-store";

const boardPostRepository = createBoardPostRepository();
const listBoardPostsUseCase = new ListBoardPostsUseCase(boardPostRepository);
const createBoardPostUseCase = new CreateBoardPostUseCase(boardPostRepository);
const updateBoardPostUseCase = new UpdateBoardPostUseCase(boardPostRepository);
const deleteBoardPostUseCase = new DeleteBoardPostUseCase(boardPostRepository);

const createEmptyDraft = (): BoardPostDraft => ({
  title: "",
  content: "",
  author: "",
  status: "draft",
});

export function useBoardPageController() {
  const boardPageState = useBoardPageStore((state) => state.boardPageState);
  const reset = useBoardPageStore((state) => state.reset);
  const loadStarted = useBoardPageStore((state) => state.loadStarted);
  const loadSucceeded = useBoardPageStore((state) => state.loadSucceeded);
  const loadFailed = useBoardPageStore((state) => state.loadFailed);
  const postSelected = useBoardPageStore((state) => state.postSelected);
  const createStarted = useBoardPageStore((state) => state.createStarted);
  const createSucceeded = useBoardPageStore((state) => state.createSucceeded);
  const createFailed = useBoardPageStore((state) => state.createFailed);
  const updateStarted = useBoardPageStore((state) => state.updateStarted);
  const updateSucceeded = useBoardPageStore((state) => state.updateSucceeded);
  const updateFailed = useBoardPageStore((state) => state.updateFailed);
  const deleteStarted = useBoardPageStore((state) => state.deleteStarted);
  const deleteSucceeded = useBoardPageStore((state) => state.deleteSucceeded);
  const deleteFailed = useBoardPageStore((state) => state.deleteFailed);
  const clearNotice = useBoardPageStore((state) => state.clearNotice);

  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [draft, setDraft] = useState<BoardPostDraft>(createEmptyDraft);

  useEffect(() => {
    reset();
    let disposed = false;

    void (async () => {
      startTransition(() => {
        loadStarted();
      });

      try {
        const posts = await listBoardPostsUseCase.execute();
        if (disposed) {
          return;
        }

        startTransition(() => {
          loadSucceeded(posts);
        });
      } catch (error) {
        if (disposed) {
          return;
        }

        startTransition(() => {
          loadFailed(error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다.");
        });
      }
    })();

    return () => {
      disposed = true;
    };
  }, [loadFailed, loadStarted, loadSucceeded, reset]);

  const selectedPost = useMemo(
    () => boardPageState.posts.find((post) => post.id === boardPageState.selectedPostId) ?? null,
    [boardPageState.posts, boardPageState.selectedPostId],
  );

  useEffect(() => {
    if (mode === "create") {
      return;
    }

    if (!selectedPost) {
      setDraft(createEmptyDraft());
      return;
    }

    setDraft({
      title: selectedPost.title,
      content: selectedPost.content,
      author: selectedPost.author,
      status: selectedPost.status,
    });
  }, [mode, selectedPost]);

  return {
    boardPageState,
    mode,
    draft,
    selectedPost,
    isLoading: boardPageState.loadStatus === "loading" && boardPageState.posts.length === 0,
    isMutating: boardPageState.mutationStatus !== "idle",
    handleSelectPost: (postId: string) => {
      setMode("edit");
      postSelected(postId);
      clearNotice();
    },
    handleStartCreate: () => {
      setMode("create");
      postSelected(null);
      setDraft(createEmptyDraft());
      clearNotice();
    },
    handleDraftChange: (patch: Partial<BoardPostDraft>) => {
      setDraft((current) => ({
        ...current,
        ...patch,
      }));
    },
    handleSubmit: () => {
      const input: CreateBoardPostInput = {
        title: draft.title.trim(),
        content: draft.content.trim(),
        author: draft.author.trim(),
        status: draft.status,
      };

      if (!input.title || !input.content || !input.author) {
        const message = "제목, 작성자, 본문을 모두 입력해야 합니다.";
        if (mode === "create") {
          createFailed(message);
        } else {
          updateFailed(message);
        }
        return;
      }

      void (async () => {
        if (mode === "create") {
          startTransition(() => {
            createStarted();
          });

          try {
            const createdPost = await createBoardPostUseCase.execute(input);
            startTransition(() => {
              createSucceeded(createdPost);
              setMode("edit");
            });
          } catch (error) {
            startTransition(() => {
              createFailed(error instanceof Error ? error.message : "게시글 생성에 실패했습니다.");
            });
          }

          return;
        }

        if (!selectedPost) {
          updateFailed("수정할 게시글이 선택되지 않았습니다.");
          return;
        }

        startTransition(() => {
          updateStarted();
        });

        try {
          const updatedPost = await updateBoardPostUseCase.execute({
            ...selectedPost,
            ...input,
          });
          startTransition(() => {
            updateSucceeded(updatedPost);
          });
        } catch (error) {
          startTransition(() => {
            updateFailed(error instanceof Error ? error.message : "게시글 수정에 실패했습니다.");
          });
        }
      })();
    },
    handleDelete: () => {
      if (!selectedPost) {
        return;
      }

      void (async () => {
        startTransition(() => {
          deleteStarted();
        });

        try {
          await deleteBoardPostUseCase.execute(selectedPost.id);
          startTransition(() => {
            deleteSucceeded(selectedPost.id);
          });
        } catch (error) {
          startTransition(() => {
            deleteFailed(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");
          });
        }
      })();
    },
  };
}
