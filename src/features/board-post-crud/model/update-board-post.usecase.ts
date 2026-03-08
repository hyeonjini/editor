import type { BoardPost } from "@/entities/board-post";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

export class UpdateBoardPostUseCase {
  constructor(private readonly boardPostRepository: BoardPostRepository) {}

  execute(post: BoardPost): Promise<BoardPost> {
    return this.boardPostRepository.update(post);
  }
}
