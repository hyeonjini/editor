"use client";

import { EditLayout } from "@/widgets/edit-layout";
import { EditorControlPanel, MainContent } from "@/widgets/main-content";

export function EditPageLoading() {
  return (
    <EditLayout
      sidebar={
        <div className="flex h-full items-center justify-center px-4 py-6 text-sm text-slate-500">
          Loading transactions...
        </div>
      }
    >
      <MainContent
        controlPanel={
          <EditorControlPanel
            isSaving={false}
            canRun={false}
            canAddElement={false}
            onSave={() => {}}
            onRun={() => {}}
            onStop={() => {}}
            onAddRequest={() => {}}
            onAddRequestGroup={() => {}}
            onAddData={() => {}}
          />
        }
      >
        <div className="flex h-full min-h-0 items-center justify-center px-8 py-10 text-center text-sm text-slate-500">
          Node editor space is preparing the current script.
        </div>
      </MainContent>
    </EditLayout>
  );
}
