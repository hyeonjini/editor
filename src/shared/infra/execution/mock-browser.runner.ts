import { MockSimulationRunnerBase } from "@/shared/infra/execution/mock-simulation-runner.base";

export class MockBrowserSimulationRunner extends MockSimulationRunnerBase {
  readonly target = "browser" as const;

  constructor() {
    super("browser");
  }
}
