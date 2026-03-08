"use client";

import { EditHeader, EditLayout } from "@/widgets/edit-layout";

export function BoardPageLoading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col border border-slate-900 bg-white">
        <EditHeader appName="게시판 CRUD 예제" />
        <EditLayout
          sidebar={
            <div className="flex h-full items-center justify-center px-4 py-6 text-sm text-slate-500">
              게시글 목록을 불러오는 중...
            </div>
          }
        >
          <div className="flex h-full items-center justify-center bg-slate-50 px-6 text-sm text-slate-500">
            게시판 예제 페이지를 준비하고 있습니다.
          </div>
        </EditLayout>
      </div>
    </div>
  );
}
