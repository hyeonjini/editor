import { create } from "zustand";

import type { BoardPost } from "@/entities/board-post";

export interface BoardPageState {
  posts: BoardPost[];
  selectedPostId: string | null;
  loadStatus: "idle" | "loading" | "loaded" | "error";
  mutationStatus: "idle" | "creating" | "updating" | "deleting";
  errorMessage: string | null;
  noticeMessage: string | null;
}

interface BoardPageStore {
  boardPageState: BoardPageState;
  reset: () => void;
  loadStarted: () => void;
  loadSucceeded: (posts: BoardPost[]) => void;
  loadFailed: (message: string) => void;
  postSelected: (postId: string | null) => void;
  createStarted: () => void;
  createSucceeded: (post: BoardPost) => void;
  createFailed: (message: string) => void;
  updateStarted: () => void;
  updateSucceeded: (post: BoardPost) => void;
  updateFailed: (message: string) => void;
  deleteStarted: () => void;
  deleteSucceeded: (postId: string) => void;
  deleteFailed: (message: string) => void;
  clearNotice: () => void;
}

const createInitialBoardPageState = (): BoardPageState => ({
  posts: [],
  selectedPostId: null,
  loadStatus: "idle",
  mutationStatus: "idle",
  errorMessage: null,
  noticeMessage: null,
});

export const useBoardPageStore = create<BoardPageStore>()((set) => ({
  boardPageState: createInitialBoardPageState(),
  reset: () => {
    set({ boardPageState: createInitialBoardPageState() });
  },
  loadStarted: () => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        loadStatus: "loading",
        errorMessage: null,
      },
    }));
  },
  loadSucceeded: (posts) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        posts,
        selectedPostId: state.boardPageState.selectedPostId ?? posts[0]?.id ?? null,
        loadStatus: "loaded",
        errorMessage: null,
      },
    }));
  },
  loadFailed: (message) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        loadStatus: "error",
        errorMessage: message,
      },
    }));
  },
  postSelected: (postId) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        selectedPostId: postId,
        errorMessage: null,
        noticeMessage: null,
      },
    }));
  },
  createStarted: () => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "creating",
        errorMessage: null,
        noticeMessage: null,
      },
    }));
  },
  createSucceeded: (post) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        posts: [post, ...state.boardPageState.posts],
        selectedPostId: post.id,
        mutationStatus: "idle",
        noticeMessage: "게시글을 생성했습니다.",
      },
    }));
  },
  createFailed: (message) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "idle",
        errorMessage: message,
      },
    }));
  },
  updateStarted: () => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "updating",
        errorMessage: null,
        noticeMessage: null,
      },
    }));
  },
  updateSucceeded: (post) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        posts: state.boardPageState.posts.map((item) => (item.id === post.id ? post : item)),
        selectedPostId: post.id,
        mutationStatus: "idle",
        noticeMessage: "게시글을 수정했습니다.",
      },
    }));
  },
  updateFailed: (message) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "idle",
        errorMessage: message,
      },
    }));
  },
  deleteStarted: () => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "deleting",
        errorMessage: null,
        noticeMessage: null,
      },
    }));
  },
  deleteSucceeded: (postId) => {
    set((state) => {
      const nextPosts = state.boardPageState.posts.filter((post) => post.id !== postId);
      return {
        boardPageState: {
          ...state.boardPageState,
          posts: nextPosts,
          selectedPostId: nextPosts[0]?.id ?? null,
          mutationStatus: "idle",
          noticeMessage: "게시글을 삭제했습니다.",
        },
      };
    });
  },
  deleteFailed: (message) => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        mutationStatus: "idle",
        errorMessage: message,
      },
    }));
  },
  clearNotice: () => {
    set((state) => ({
      boardPageState: {
        ...state.boardPageState,
        noticeMessage: null,
      },
    }));
  },
}));
