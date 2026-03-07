import type { TransactionStep } from "@/entities/script/model/nodes";

export interface Transaction {
  id: string;
  name: string;
  description?: string;
  steps: TransactionStep[];
}
