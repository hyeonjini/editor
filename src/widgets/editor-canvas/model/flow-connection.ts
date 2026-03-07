export interface FlowConnectionSnapshot {
  id: string;
  source: string;
  target: string;
}

export type FlowConnectionMap = Record<string, FlowConnectionSnapshot[]>;
