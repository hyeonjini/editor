import type { Script } from "@/entities/script";

export interface HarImportResult {
  script: Script;
  warnings: string[];
}

export interface HarImporter {
  importFromJson(harJson: string): Promise<HarImportResult>;
}
