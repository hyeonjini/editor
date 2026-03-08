import { MockScriptRepository } from "@/shared/infra/repository/mock-script.repository";
import { MockEditorDocumentRepository } from "@/shared/infra/repository/mock-editor-document.repository";

export const sharedMockScriptRepository = new MockScriptRepository();
export const sharedMockEditorDocumentRepository = new MockEditorDocumentRepository(sharedMockScriptRepository);
