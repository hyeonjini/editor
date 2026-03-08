import type { BoardPost } from "@/entities/board-post";

export interface BoardPostSerializer<TDto> {
  serialize(post: BoardPost): TDto;
  deserialize(dto: TDto): BoardPost;
}
