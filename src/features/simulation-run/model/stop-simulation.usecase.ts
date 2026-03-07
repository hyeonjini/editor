import type { ExecutionTarget } from "@/entities/execution";
import type { SimulationRunnerFactory } from "@/features/simulation-run/model/simulation-runner.factory";

export class StopSimulationUseCase {
  constructor(private readonly runnerFactory: SimulationRunnerFactory) {}

  execute(target: ExecutionTarget, sessionId: string): Promise<void> {
    const runner = this.runnerFactory.get(target);
    return runner.stop(sessionId);
  }
}
