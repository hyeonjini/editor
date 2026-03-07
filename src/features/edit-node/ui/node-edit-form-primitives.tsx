import type { ReactNode } from "react";

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>;
}

export function getInputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border px-4 py-3 outline-none transition",
    hasError
      ? "border-rose-300 bg-rose-50 text-rose-950 focus:border-rose-500"
      : "border-slate-200 bg-white text-slate-950 focus:border-slate-400",
  ].join(" ");
}
