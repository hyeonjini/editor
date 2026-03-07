"use client";

import { useEditPageController } from "@/views/edit/model/use-edit-page-controller";
import { EditPageLoading } from "@/views/edit/ui/edit-page-loading";
import { EditPageView } from "@/views/edit/ui/edit-page-view";

export function EditPage() {
  const controller = useEditPageController();

  if (!controller.currentScript) {
    return <EditPageLoading />;
  }

  return <EditPageView {...controller} />;
}
