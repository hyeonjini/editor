import type { TransactionSnbItem } from "@/widgets/transaction-snb/model/build-transaction-snb-items";

interface TransactionSnbProps {
  transactions: TransactionSnbItem[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
  onRunTransaction: (transactionId: string) => void;
}

export function TransactionSnb({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onRunTransaction,
}: TransactionSnbProps) {
  return (
    <section className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-900 px-4 py-4">
        <p className="text-sm font-semibold text-slate-950">Transactions</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {transactions.map((transaction, index) => {
          const isSelected = selectedTransactionId === transaction.id;

          return (
            <div
              key={transaction.id}
              className={[
                "border-b border-slate-900 px-4 py-4 transition",
                isSelected ? "bg-slate-900 text-white" : "bg-white text-slate-800",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                    Tx {index + 1}
                  </p>
                  <StatusBadge status={transaction.status} inverted={isSelected} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRunTransaction(transaction.id);
                  }}
                  className={[
                    "rounded-sm border px-2.5 py-1 text-xs font-medium transition",
                    isSelected
                      ? "border-white/70 text-white hover:bg-white/10"
                      : "border-slate-900 text-slate-900 hover:bg-slate-100",
                  ].join(" ")}
                >
                  Run
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectTransaction(transaction.id);
                }}
                className={[
                  "mt-3 w-full text-left transition",
                  isSelected ? "text-white" : "text-slate-800 hover:text-slate-950",
                ].join(" ")}
              >
                <p className="text-sm font-semibold">{transaction.name}</p>
                <p className="mt-2 text-xs opacity-70">{transaction.stepCount} steps</p>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
  inverted,
}: {
  status: TransactionSnbItem["status"];
  inverted: boolean;
}) {
  if (status === "idle") {
    return null;
  }

  const className =
    status === "running"
      ? inverted
        ? "bg-sky-200 text-sky-950"
        : "bg-sky-100 text-sky-900"
      : status === "failed"
        ? inverted
          ? "bg-rose-200 text-rose-950"
          : "bg-rose-100 text-rose-900"
        : inverted
          ? "bg-emerald-200 text-emerald-950"
          : "bg-emerald-100 text-emerald-900";

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${className}`}>
      {status}
    </span>
  );
}
