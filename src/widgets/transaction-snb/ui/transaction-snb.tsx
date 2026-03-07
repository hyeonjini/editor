interface TransactionItem {
  id: string;
  name: string;
  stepCount: number;
}

interface TransactionSnbProps {
  transactions: TransactionItem[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
}

export function TransactionSnb({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
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
            <button
              key={transaction.id}
              type="button"
              onClick={() => {
                onSelectTransaction(transaction.id);
              }}
              className={[
                "w-full border-b border-slate-900 px-4 py-4 text-left transition",
                isSelected
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-800 hover:bg-slate-100",
              ].join(" ")}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                Tx {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold">{transaction.name}</p>
              <p className="mt-2 text-xs opacity-70">{transaction.stepCount} steps</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
