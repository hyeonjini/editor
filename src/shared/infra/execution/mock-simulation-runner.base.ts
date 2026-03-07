import type { ExecutionEvent, ExecutionSession, ExecutionTarget } from "@/entities/execution";
import type { RequestNode, Script, TransactionStep } from "@/entities/script";
import type { SimulationRunner, StartExecutionInput } from "@/shared/ports/simulation-runner.port";

type Listener = (event: ExecutionEvent) => void;

interface SessionState {
  input: StartExecutionInput;
  listeners: Set<Listener>;
  timers: ReturnType<typeof setTimeout>[];
  completed: boolean;
}

const isRequestNode = (step: TransactionStep): step is RequestNode => step.type === "request";

const isRequestGroupNode = (step: TransactionStep): step is Extract<TransactionStep, { type: "request-group" }> =>
  step.type === "request-group";

const isDataNode = (step: TransactionStep): step is Extract<TransactionStep, { type: "data" }> =>
  step.type === "data";

const collectEvents = (
  sessionId: string,
  target: ExecutionTarget,
  script: Script,
): Array<{ delayMs: number; event: ExecutionEvent }> => {
  const events: Array<{ delayMs: number; event: ExecutionEvent }> = [];
  let delayMs = 0;

  events.push({
    delayMs,
    event: {
      type: "execution.started",
      sessionId,
      target,
      timestamp: new Date().toISOString(),
    },
  });

  script.transactions.forEach((transaction) => {
    delayMs += 120;
    events.push({
      delayMs,
      event: {
        type: "transaction.started",
        sessionId,
        transactionId: transaction.id,
        timestamp: new Date().toISOString(),
      },
    });

    transaction.steps.forEach((step) => {
      if (isDataNode(step)) {
        delayMs += 80;
        events.push({
          delayMs,
          event: {
            type: "log.appended",
            sessionId,
            level: "info",
            message: `Data node resolved: ${step.name}`,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (isRequestNode(step)) {
        delayMs += 120;
        events.push({
          delayMs,
          event: {
            type: "request.started",
            sessionId,
            nodeId: step.id,
            timestamp: new Date().toISOString(),
          },
        });

        delayMs += 220;
        events.push({
          delayMs,
          event: {
            type: "request.finished",
            sessionId,
            nodeId: step.id,
            statusCode: 200,
            durationMs: 220,
            success: true,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (isRequestGroupNode(step)) {
        step.requests.forEach((request, index) => {
          delayMs += 70;
          events.push({
            delayMs,
            event: {
              type: "request.started",
              sessionId,
              nodeId: request.id,
              timestamp: new Date().toISOString(),
            },
          });

          events.push({
            delayMs: delayMs + 180 + index * 40,
            event: {
              type: "request.finished",
              sessionId,
              nodeId: request.id,
              statusCode: 200,
              durationMs: 180 + index * 40,
              success: true,
              timestamp: new Date().toISOString(),
            },
          });
        });

        delayMs += 260 + step.requests.length * 40;
      }
    });
  });

  events.push({
    delayMs: delayMs + 160,
    event: {
      type: "execution.completed",
      sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  return events;
};

export abstract class MockSimulationRunnerBase implements SimulationRunner {
  abstract readonly target: ExecutionTarget;

  private readonly sessions = new Map<string, SessionState>();

  constructor(private readonly sessionPrefix: string) {}

  async start(input: StartExecutionInput): Promise<ExecutionSession> {
    const sessionId = `${this.sessionPrefix}_${Date.now()}`;
    const startedAt = new Date().toISOString();

    this.sessions.set(sessionId, {
      input,
      listeners: new Set(),
      timers: [],
      completed: false,
    });

    this.scheduleScenario(sessionId);

    return {
      sessionId,
      target: this.target,
      startedAt,
    };
  }

  async stop(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.completed) {
      return;
    }

    session.timers.forEach((timer) => clearTimeout(timer));
    session.timers = [];
    session.completed = true;

    this.emit(sessionId, {
      type: "log.appended",
      sessionId,
      level: "warn",
      message: "Execution stopped by user",
      timestamp: new Date().toISOString(),
    });

    this.emit(sessionId, {
      type: "execution.completed",
      sessionId,
      timestamp: new Date().toISOString(),
    });

    this.sessions.delete(sessionId);
  }

  subscribe(sessionId: string, listener: Listener): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return () => undefined;
    }

    session.listeners.add(listener);

    return () => {
      const currentSession = this.sessions.get(sessionId);
      currentSession?.listeners.delete(listener);
    };
  }

  protected emit(sessionId: string, event: ExecutionEvent): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.listeners.forEach((listener) => listener(event));
  }

  private scheduleScenario(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const events = collectEvents(sessionId, this.target, session.input.script);

    session.timers = events.map(({ delayMs, event }) =>
      setTimeout(() => {
        const currentSession = this.sessions.get(sessionId);
        if (!currentSession || currentSession.completed) {
          return;
        }

        this.emit(sessionId, {
          ...event,
          timestamp: new Date().toISOString(),
        });

        if (event.type === "execution.completed" || event.type === "execution.failed") {
          currentSession.completed = true;
          this.sessions.delete(sessionId);
        }
      }, delayMs),
    );
  }
}
