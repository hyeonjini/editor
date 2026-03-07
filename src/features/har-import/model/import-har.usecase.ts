import type { HarImportResult, HarImporter } from "@/shared/ports/har-importer.port";

export class ImportHarUseCase {
  constructor(private readonly harImporter: HarImporter) {}

  execute(harJson: string): Promise<HarImportResult> {
    return this.harImporter.importFromJson(harJson);
  }
}
