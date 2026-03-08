"use client";

import { useBoardPageController } from "@/views/board/model/use-board-page-controller";
import { BoardPageLoading } from "@/views/board/ui/board-page-loading";
import { BoardPageView } from "@/views/board/ui/board-page-view";

export function BoardPage() {
  const controller = useBoardPageController();

  if (controller.isLoading) {
    return <BoardPageLoading />;
  }

  return <BoardPageView {...controller} />;
}
