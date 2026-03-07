import type { Script } from "@/entities/script";
import { removeNodeById } from "@/features/edit-node/model/script-node.helpers";

export class RemoveScriptNodeUseCase {
  execute(script: Script, nodeId: string): Script {
    return removeNodeById(script, nodeId);
  }
}
