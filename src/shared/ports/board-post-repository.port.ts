import type { BoardPost, CreateBoardPostInput } from "@/entities/board-post";

export interface BoardPostRepository {
  list(): Promise<BoardPost[]>;
  create(input: CreateBoardPostInput): Promise<BoardPost>;
  update(post: BoardPost): Promise<BoardPost>;
  remove(postId: string): Promise<void>;
}
