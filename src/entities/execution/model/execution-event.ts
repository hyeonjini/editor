import type { ExecutionTarget } from "@/entities/execution/model/execution-target";

export type ExecutionEvent =
  | {
      type: "execution.started";
      sessionId: string;
      target: ExecutionTarget;
      timestamp: string;
    }
  | {
      type: "transaction.started";
      sessionId: string;
      transactionId: string;
      timestamp: string;
    }
  | {
      type: "request.started";
      sessionId: string;
      nodeId: string;
      timestamp: string;
    }
  | {
      type: "request.finished";
      sessionId: string;
      nodeId: string;
      statusCode: number;
      durationMs: number;
      success: boolean;
      timestamp: string;
    }
  | {
      type: "log.appended";
      sessionId: string;
      level: "info" | "warn" | "error";
      message: string;
      timestamp: string;
    }
  | {
      type: "execution.failed";
      sessionId: string;
      reason: string;
      timestamp: string;
    }
  | {
      type: "execution.completed";
      sessionId: string;
      timestamp: string;
    };
