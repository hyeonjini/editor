import { MockSimulationRunnerBase } from "@/shared/infra/execution/mock-simulation-runner.base";

export class MockServerSimulationRunner extends MockSimulationRunnerBase {
  readonly target = "server" as const;

  constructor() {
    super("server");
  }
}
