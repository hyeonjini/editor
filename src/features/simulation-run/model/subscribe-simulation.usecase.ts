import type { ExecutionEvent, ExecutionTarget } from "@/entities/execution";
import type { SimulationRunnerFactory } from "@/features/simulation-run/model/simulation-runner.factory";

export class SubscribeSimulationUseCase {
  constructor(private readonly runnerFactory: SimulationRunnerFactory) {}

  execute(
    target: ExecutionTarget,
    sessionId: string,
    listener: (event: ExecutionEvent) => void,
  ): () => void {
    const runner = this.runnerFactory.get(target);
    return runner.subscribe(sessionId, listener);
  }
}
