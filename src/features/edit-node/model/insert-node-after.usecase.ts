import type { RequestNode, Script, TransactionStep } from "@/entities/script";
import { insertNodeAfterTarget } from "@/features/edit-node/model/script-node.helpers";

export class InsertNodeAfterUseCase {
  execute(script: Script, targetNodeId: string, newNode: TransactionStep | RequestNode): Script {
    return insertNodeAfterTarget(script, targetNodeId, newNode);
  }
}
