import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

export class DeleteBoardPostUseCase {
  constructor(private readonly boardPostRepository: BoardPostRepository) {}

  execute(postId: string): Promise<void> {
    return this.boardPostRepository.remove(postId);
  }
}
