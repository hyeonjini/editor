import type { ReactNode } from "react";

interface EditLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function EditLayout({ sidebar, children }: EditLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-slate-900 bg-white">{sidebar}</aside>
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
