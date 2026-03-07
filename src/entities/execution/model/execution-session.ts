import type { ExecutionTarget } from "@/entities/execution/model/execution-target";

export interface ExecutionSession {
  sessionId: string;
  target: ExecutionTarget;
  startedAt: string;
}
