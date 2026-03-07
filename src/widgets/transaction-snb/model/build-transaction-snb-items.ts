import type { TransactionExecutionStatus } from "@/entities/execution";
import type { Transaction } from "@/entities/script";

export interface TransactionSnbItem {
  id: string;
  name: string;
  stepCount: number;
  status: TransactionExecutionStatus;
}

export const buildTransactionSnbItems = (
  transactions: Transaction[],
  transactionStatuses: Record<string, TransactionExecutionStatus>,
): TransactionSnbItem[] =>
  transactions.map((transaction) => ({
    id: transaction.id,
    name: transaction.name,
    stepCount: transaction.steps.length,
    status: transactionStatuses[transaction.id] ?? "idle",
  }));
