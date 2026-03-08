import type { RequestGroupNode } from "@/entities/script";

export interface HarImportResult {
  requestGroup: RequestGroupNode;
  importedRequestCount: number;
  warnings: string[];
}

export interface HarImporter {
  importFromJson(harJson: string): Promise<HarImportResult>;
}
