interface EditHeaderProps {
  appName: string;
}

export function EditHeader({ appName }: EditHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-slate-900 bg-white px-5">
      <span className="text-sm font-semibold text-slate-950">{appName}</span>
    </header>
  );
}
