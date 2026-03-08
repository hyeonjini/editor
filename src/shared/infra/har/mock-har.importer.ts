import type { HarImportResult, HarImporter } from "@/shared/ports/har-importer.port";
import { parseHarJson } from "@/shared/infra/har/har-json.parser";
import { mapHarEntriesToRequestGroup } from "@/shared/infra/har/har-to-request-group.mapper";

export class HarJsonImporter implements HarImporter {
  async importFromJson(harJson: string): Promise<HarImportResult> {
    const parsed = parseHarJson(harJson);
    return mapHarEntriesToRequestGroup(parsed.log.entries ?? []);
  }
}

export const MockHarImporter = HarJsonImporter;
