import type { ExecutionEvent, ExecutionSession, ExecutionTarget } from "@/entities/execution";
import type { Script } from "@/entities/script";

export interface ExecutionOptions {
  virtualUsers?: number;
  durationMs?: number;
}

export interface StartExecutionInput {
  script: Script;
  target: ExecutionTarget;
  options?: ExecutionOptions;
}

export interface SimulationRunner {
  readonly target: ExecutionTarget;
  start(input: StartExecutionInput): Promise<ExecutionSession>;
  stop(sessionId: string): Promise<void>;
  subscribe(sessionId: string, listener: (event: ExecutionEvent) => void): () => void;
}
