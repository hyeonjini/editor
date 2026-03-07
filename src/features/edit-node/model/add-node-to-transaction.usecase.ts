import type { Script, TransactionStep } from "@/entities/script";
import { appendNodeToTransaction } from "@/features/edit-node/model/script-node.helpers";

export class AddNodeToTransactionUseCase {
  execute(script: Script, transactionId: string, newNode: TransactionStep): Script {
    return appendNodeToTransaction(script, transactionId, newNode);
  }
}
