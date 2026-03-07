import type { ExecutionSession, ExecutionTarget } from "@/entities/execution";
import type { Script } from "@/entities/script";
import type { ExecutionOptions, ExecutionScope } from "@/shared/ports/simulation-runner.port";
import type { SimulationRunnerFactory } from "@/features/simulation-run/model/simulation-runner.factory";

export interface StartSimulationInput {
  script: Script;
  target: ExecutionTarget;
  scope?: ExecutionScope;
  options?: ExecutionOptions;
}

export class StartSimulationUseCase {
  constructor(private readonly runnerFactory: SimulationRunnerFactory) {}

  execute(input: StartSimulationInput): Promise<ExecutionSession> {
    const runner = this.runnerFactory.get(input.target);
    return runner.start(input);
  }
}
