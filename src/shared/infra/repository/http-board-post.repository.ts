import type { BoardPost, CreateBoardPostInput } from "@/entities/board-post";
import type {
  CreateBoardPostRequestDto,
  CreateBoardPostResponseDto,
  ListBoardPostsResponseDto,
  UpdateBoardPostRequestDto,
  UpdateBoardPostResponseDto,
} from "@/shared/api/dto/board-post-api.dto";
import type { BoardPostDto } from "@/shared/api/dto/board-post.dto";
import type { ApiClient } from "@/shared/api/http-client";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";
import type { BoardPostSerializer } from "@/shared/ports/board-post-serializer.port";

export class HttpBoardPostRepository implements BoardPostRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly serializer: BoardPostSerializer<BoardPostDto>,
  ) {}

  async list(): Promise<BoardPost[]> {
    const response = await this.apiClient.request<ListBoardPostsResponseDto>("/api/board-posts", {
      method: "GET",
    });

    return response.posts.map((post) => this.serializer.deserialize(post));
  }

  async create(input: CreateBoardPostInput): Promise<BoardPost> {
    const response = await this.apiClient.request<CreateBoardPostResponseDto>("/api/board-posts", {
      method: "POST",
      body: {
        post: input,
      } satisfies CreateBoardPostRequestDto,
    });

    return this.serializer.deserialize(response.post);
  }

  async update(post: BoardPost): Promise<BoardPost> {
    const response = await this.apiClient.request<UpdateBoardPostResponseDto>(`/api/board-posts/${post.id}`, {
      method: "PUT",
      body: {
        post: this.serializer.serialize(post),
      } satisfies UpdateBoardPostRequestDto,
    });

    return this.serializer.deserialize(response.post);
  }

  async remove(postId: string): Promise<void> {
    await this.apiClient.request<void>(`/api/board-posts/${postId}`, {
      method: "DELETE",
    });
  }
}
