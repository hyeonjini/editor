import type { RequestNode, Script, TransactionStep } from "@/entities/script";
import {
  findLocatedScriptNode,
  replaceLocatedScriptNode,
} from "@/features/edit-node/model/script-node.helpers";

export class ReplaceScriptNodeUseCase {
  execute(script: Script, nodeId: string, nextNode: TransactionStep | RequestNode): Script {
    const location = findLocatedScriptNode(script, nodeId);

    if (!location) {
      return script;
    }

    return replaceLocatedScriptNode(script, location, nextNode);
  }
}
