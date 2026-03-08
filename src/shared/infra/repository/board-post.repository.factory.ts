import { FetchApiClient } from "@/shared/api/http-client";
import { MockBoardPostRepository } from "@/shared/infra/repository/mock-board-post.repository";
import { HttpBoardPostRepository } from "@/shared/infra/repository/http-board-post.repository";
import { boardPostJsonSerializer } from "@/shared/infra/serializer/board-post-json.serializer";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

const sharedMockBoardPostRepository = new MockBoardPostRepository();

export interface BoardPostRepositoryFactoryOptions {
  dataSource?: "mock" | "http";
  baseUrl?: string;
}

export function createBoardPostRepository(
  options: BoardPostRepositoryFactoryOptions = {},
): BoardPostRepository {
  const dataSource =
    options.dataSource ?? (process.env.NEXT_PUBLIC_BOARD_POST_DATA_SOURCE === "http" ? "http" : "mock");

  if (dataSource === "http") {
    return new HttpBoardPostRepository(
      new FetchApiClient({
        baseUrl: options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL,
      }),
      boardPostJsonSerializer,
    );
  }

  return sharedMockBoardPostRepository;
}
