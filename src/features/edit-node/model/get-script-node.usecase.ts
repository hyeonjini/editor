import type { Script } from "@/entities/script";
import { findLocatedScriptNode } from "@/features/edit-node/model/script-node.helpers";

export class GetScriptNodeUseCase {
  execute(script: Script, nodeId: string) {
    return findLocatedScriptNode(script, nodeId);
  }
}
