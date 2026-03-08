import type { BoardPostDto } from "@/shared/api/dto/board-post.dto";

export interface ListBoardPostsResponseDto {
  posts: BoardPostDto[];
}

export interface CreateBoardPostRequestDto {
  post: {
    title: string;
    content: string;
    author: string;
    status: BoardPostDto["status"];
  };
}

export interface CreateBoardPostResponseDto {
  post: BoardPostDto;
}

export interface UpdateBoardPostRequestDto {
  post: BoardPostDto;
}

export interface UpdateBoardPostResponseDto {
  post: BoardPostDto;
}
