import { sampleScript } from "@/shared/mock/script.sample";
import type { HarImportResult, HarImporter } from "@/shared/ports/har-importer.port";

export class MockHarImporter implements HarImporter {
  async importFromJson(_harJson: string): Promise<HarImportResult> {
    return {
      script: structuredClone(sampleScript),
      warnings: [],
    };
  }
}
