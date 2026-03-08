import type { BoardPostDto } from "@/shared/api/dto/board-post.dto";
import type { BoardPostSerializer } from "@/shared/ports/board-post-serializer.port";

export const boardPostJsonSerializer: BoardPostSerializer<BoardPostDto> = {
  serialize(post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  },
  deserialize(dto) {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      author: dto.author,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },
};
