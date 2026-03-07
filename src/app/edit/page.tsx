import { EditHeader } from "@/widgets/edit-layout";
import { EditPage } from "@/views/edit";

export default function EditRoutePage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col border border-slate-900 bg-white">
        <EditHeader appName="HTTP Scenario Editor" />
        <EditPage />
      </div>
    </div>
  );
}
