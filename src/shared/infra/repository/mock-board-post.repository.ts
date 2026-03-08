import type { BoardPost, CreateBoardPostInput } from "@/entities/board-post";
import { createBoardPostId } from "@/entities/board-post";
import { nowIso } from "@/shared/lib/date";
import { sampleBoardPosts } from "@/shared/mock/board-post.sample";
import type { BoardPostRepository } from "@/shared/ports/board-post-repository.port";

export class MockBoardPostRepository implements BoardPostRepository {
  private readonly memoryStore = new Map<string, BoardPost>();

  constructor(seedPosts: BoardPost[] = sampleBoardPosts) {
    seedPosts.forEach((post) => {
      this.memoryStore.set(post.id, structuredClone(post));
    });
  }

  async list(): Promise<BoardPost[]> {
    return Array.from(this.memoryStore.values())
      .map((post) => structuredClone(post))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async create(input: CreateBoardPostInput): Promise<BoardPost> {
    const now = nowIso();
    const post: BoardPost = {
      id: createBoardPostId(String(Date.now())),
      title: input.title,
      content: input.content,
      author: input.author,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.set(post.id, post);
    return structuredClone(post);
  }

  async update(post: BoardPost): Promise<BoardPost> {
    if (!this.memoryStore.has(post.id)) {
      throw new Error(`Board post not found: ${post.id}`);
    }

    const updatedPost: BoardPost = {
      ...structuredClone(post),
      updatedAt: nowIso(),
    };

    this.memoryStore.set(updatedPost.id, updatedPost);
    return structuredClone(updatedPost);
  }

  async remove(postId: string): Promise<void> {
    this.memoryStore.delete(postId);
  }
}
