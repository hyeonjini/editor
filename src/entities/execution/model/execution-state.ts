import type { ExecutionEvent } from "@/entities/execution/model/execution-event";
import type { ExecutionTarget } from "@/entities/execution/model/execution-target";

export type ExecutionStatus = "idle" | "starting" | "running" | "stopping" | "completed" | "failed";
export type NodeExecutionStatus = "idle" | "running" | "passed" | "failed";

export interface ExecutionLogItem {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
}

export interface ExecutionState {
  sessionId: string | null;
  target: ExecutionTarget | null;
  status: ExecutionStatus;
  activeTransactionId: string | null;
  activeNodeId: string | null;
  logs: ExecutionLogItem[];
  nodeStatuses: Record<string, NodeExecutionStatus>;
  startedAt: string | null;
  endedAt: string | null;
  errorMessage: string | null;
}

export const createInitialExecutionState = (): ExecutionState => ({
  sessionId: null,
  target: null,
  status: "idle",
  activeTransactionId: null,
  activeNodeId: null,
  logs: [],
  nodeStatuses: {},
  startedAt: null,
  endedAt: null,
  errorMessage: null,
});

export const applyExecutionEventToState = (
  state: ExecutionState,
  event: ExecutionEvent,
): ExecutionState => {
  switch (event.type) {
    case "execution.started":
      return {
        sessionId: event.sessionId,
        target: event.target,
        status: "running",
        activeTransactionId: null,
        activeNodeId: null,
        logs: [],
        nodeStatuses: {},
        startedAt: event.timestamp,
        endedAt: null,
        errorMessage: null,
      };
    case "transaction.started":
      return {
        ...state,
        activeTransactionId: event.transactionId,
      };
    case "request.started":
      return {
        ...state,
        status: "running",
        activeNodeId: event.nodeId,
        nodeStatuses: {
          ...state.nodeStatuses,
          [event.nodeId]: "running",
        },
      };
    case "request.finished":
      return {
        ...state,
        activeNodeId: state.activeNodeId === event.nodeId ? null : state.activeNodeId,
        nodeStatuses: {
          ...state.nodeStatuses,
          [event.nodeId]: event.success ? "passed" : "failed",
        },
      };
    case "log.appended":
      return {
        ...state,
        logs: [
          ...state.logs,
          {
            level: event.level,
            message: event.message,
            timestamp: event.timestamp,
          },
        ],
      };
    case "execution.failed":
      return {
        ...state,
        status: "failed",
        activeNodeId: null,
        endedAt: event.timestamp,
        errorMessage: event.reason,
      };
    case "execution.completed":
      return {
        ...state,
        status: "completed",
        activeTransactionId: null,
        activeNodeId: null,
        endedAt: event.timestamp,
      };
    default:
      return state;
  }
};
