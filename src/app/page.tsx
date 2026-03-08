import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fff5cf,transparent_30%),linear-gradient(180deg,#fffdf8,#f8fafc)] px-6">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white/90 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Editor Page
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">
          HTTP load test editor scaffold
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          React Flow based edit canvas scaffold is available under the edit route.
        </p>
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/edit"
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Open edit page
            </Link>
            <Link
              href="/board"
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Open board example
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
