import type { Script } from "@/entities/script";
import { appendNodeToTransaction } from "@/features/edit-node/model/script-node.helpers";
import type { HarImporter } from "@/shared/ports/har-importer.port";

export interface ImportHarIntoTransactionResult {
  nextScript: Script;
  requestGroupId: string;
  importedRequestCount: number;
  warnings: string[];
}

export class ImportHarIntoTransactionUseCase {
  constructor(private readonly harImporter: HarImporter) {}

  async execute(script: Script, transactionId: string, harJson: string): Promise<ImportHarIntoTransactionResult> {
    const importResult = await this.harImporter.importFromJson(harJson);
    const nextScript = appendNodeToTransaction(script, transactionId, importResult.requestGroup);

    return {
      nextScript,
      requestGroupId: importResult.requestGroup.id,
      importedRequestCount: importResult.importedRequestCount,
      warnings: importResult.warnings,
    };
  }
}
