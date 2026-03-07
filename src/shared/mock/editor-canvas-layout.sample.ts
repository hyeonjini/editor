import { buildDefaultConnections } from "@/widgets/editor-canvas";
import type { FlowConnectionMap } from "@/widgets/editor-canvas/model/flow-connection";
import type { FlowLayoutSnapshot } from "@/widgets/editor-canvas/model/flow-layout";
import { sampleScript } from "@/shared/mock/script.sample";

export const sampleEditorCanvasLayout: FlowLayoutSnapshot = {
  data_1: {
    position: { x: 80, y: 80 },
  },
  req_1: {
    position: { x: 80, y: 250 },
  },
  group_1: {
    position: { x: 430, y: 160 },
  },
};

export const sampleEditorCanvasConnections: FlowConnectionMap = buildDefaultConnections(sampleScript);
