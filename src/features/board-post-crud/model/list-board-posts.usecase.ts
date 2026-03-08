import type { BoardPost } from "@/entities/board-post";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

export class ListBoardPostsUseCase {
  constructor(private readonly boardPostRepository: BoardPostRepository) {}

  execute(): Promise<BoardPost[]> {
    return this.boardPostRepository.list();
  }
}
