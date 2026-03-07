import type { Script } from "@/entities/script";
import { nowIso } from "@/shared/lib/date";
import type { EditorDocument } from "@/shared/model/editor-document";
import { sampleEditorCanvasConnections, sampleEditorCanvasLayout, sampleScript } from "@/shared/mock";
import type { EditorDocumentRepository } from "@/shared/ports/editor-document-repository.port";
import type { SaveScriptResult, ScriptRepository } from "@/shared/ports/script-repository.port";

const createSeedDocument = (script: Script): EditorDocument => ({
  script: structuredClone(script),
  view: {
    layout: structuredClone(sampleEditorCanvasLayout),
    connections: structuredClone(sampleEditorCanvasConnections),
  },
});

export class MockScriptRepository implements ScriptRepository, EditorDocumentRepository {
  private readonly memoryStore: Map<string, EditorDocument>;
  private readonly versions = new Map<string, number>();

  constructor(seedScripts: Script[] = [sampleScript]) {
    this.memoryStore = seedScripts.length
      ? new Map(seedScripts.map((script) => [script.id, createSeedDocument(script)]))
      : new Map([[sampleScript.id, createSeedDocument(sampleScript)]]);

    this.memoryStore.forEach((document) => {
      this.versions.set(document.script.id, 1);
    });
  }

  async load(scriptId: string): Promise<Script> {
    const document = this.memoryStore.get(scriptId);
    if (!document) {
      throw new Error(`Script not found: ${scriptId}`);
    }

    return structuredClone(document.script);
  }

  async save(script: Script): Promise<SaveScriptResult> {
    const document = await this.loadDocument(script.id).catch(() => createSeedDocument(script));
    return this.saveDocument({
      ...document,
      script,
    });
  }

  async loadDocument(scriptId: string): Promise<EditorDocument> {
    const document = this.memoryStore.get(scriptId);
    if (!document) {
      throw new Error(`Script not found: ${scriptId}`);
    }

    return structuredClone(document);
  }

  async saveDocument(document: EditorDocument): Promise<SaveScriptResult> {
    const savedAt = nowIso();
    const nextVersion = (this.versions.get(document.script.id) ?? 0) + 1;
    const storedScript: Script = {
      ...structuredClone(document.script),
      createdAt: document.script.createdAt ?? savedAt,
      updatedAt: savedAt,
    };
    const storedDocument: EditorDocument = {
      script: storedScript,
      view: {
        layout: structuredClone(document.view.layout),
        connections: structuredClone(document.view.connections),
      },
    };

    this.memoryStore.set(storedScript.id, storedDocument);
    this.versions.set(storedScript.id, nextVersion);

    return {
      savedAt,
      version: String(nextVersion),
    };
  }

  seed(script: Script): void {
    this.memoryStore.set(script.id, createSeedDocument(script));
    this.versions.set(script.id, 1);
  }

  reset(): void {
    this.memoryStore.clear();
    this.versions.clear();
    this.seed(sampleScript);
  }
}
