import type { XYPosition } from "@xyflow/react";

export interface FlowNodeLayout {
  position: XYPosition;
  parentId?: string;
}

export type FlowLayoutSnapshot = Record<string, FlowNodeLayout>;
