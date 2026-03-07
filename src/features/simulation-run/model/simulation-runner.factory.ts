import type { ExecutionTarget } from "@/entities/execution";
import type { SimulationRunner } from "@/shared/ports/simulation-runner.port";

export class SimulationRunnerFactory {
  constructor(private readonly runners: SimulationRunner[]) {}

  get(target: ExecutionTarget): SimulationRunner {
    const runner = this.runners.find((item) => item.target === target);
    if (!runner) {
      throw new Error(`SimulationRunner not found for target: ${target}`);
    }
    return runner;
  }
}
