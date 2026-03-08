import type { BoardPost, CreateBoardPostInput } from "@/entities/board-post";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

export class CreateBoardPostUseCase {
  constructor(private readonly boardPostRepository: BoardPostRepository) {}

  execute(input: CreateBoardPostInput): Promise<BoardPost> {
    return this.boardPostRepository.create(input);
  }
}
