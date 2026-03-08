export type BoardPostStatus = "draft" | "published";

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  status: BoardPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardPostInput {
  title: string;
  content: string;
  author: string;
  status: BoardPostStatus;
}
