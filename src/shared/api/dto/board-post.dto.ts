import type { BoardPostStatus } from "@/entities/board-post";

export interface BoardPostDto {
  id: string;
  title: string;
  content: string;
  author: string;
  status: BoardPostStatus;
  createdAt: string;
  updatedAt: string;
}
