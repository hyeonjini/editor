import type { BoardPost } from "@/entities/board-post";

interface BoardPostListProps {
  posts: BoardPost[];
  selectedPostId: string | null;
  onSelectPost: (postId: string) => void;
  onStartCreate: () => void;
}

export function BoardPostList({
  posts,
  selectedPostId,
  onSelectPost,
  onStartCreate,
}: BoardPostListProps) {
  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-900 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">게시판</p>
          <p className="mt-1 text-xs text-slate-500">CRUD 흐름 예제</p>
        </div>
        <button
          type="button"
          onClick={onStartCreate}
          className="rounded-sm border border-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
        >
          New Post
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {posts.map((post) => {
          const isSelected = post.id === selectedPostId;

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                onSelectPost(post.id);
              }}
              className={[
                "block w-full border-b border-slate-200 px-4 py-4 text-left transition",
                isSelected ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold">{post.title}</p>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    isSelected
                      ? "bg-white/15 text-white"
                      : post.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                  ].join(" ")}
                >
                  {post.status}
                </span>
              </div>
              <p className={["mt-2 text-xs", isSelected ? "text-white/70" : "text-slate-500"].join(" ")}>
                {post.author} · {new Date(post.updatedAt).toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
