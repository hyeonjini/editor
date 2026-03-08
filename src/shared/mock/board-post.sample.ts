import type { BoardPost } from "@/entities/board-post";
import { nowIso } from "@/shared/lib/date";

const now = nowIso();

export const sampleBoardPosts: BoardPost[] = [
  {
    id: "post_1",
    title: "게시판 CRUD 예제 시작",
    content: "이 페이지는 현재 프로젝트의 CRUD 흐름을 이해하기 위한 예제입니다.",
    author: "Admin",
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post_2",
    title: "Repository와 UseCase 분리",
    content: "UI는 repository를 직접 모르고 use case를 통해 CRUD를 수행합니다.",
    author: "Codex",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  },
];
