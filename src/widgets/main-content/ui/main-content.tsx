import type { ReactNode } from "react";

interface MainContentProps {
  controlPanel: ReactNode;
  children: ReactNode;
}

export function MainContent({ controlPanel, children }: MainContentProps) {
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <div>{controlPanel}</div>
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </section>
  );
}
