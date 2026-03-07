import type { Script } from "@/entities/script";
import type { FlowConnectionMap, FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";

const createConnectionId = (transactionId: string, source: string, target: string): string =>
  `${transactionId}:${source}->${target}`;

export const buildDefaultConnections = (script: Script): FlowConnectionMap => {
  const connections: FlowConnectionMap = {};

  script.transactions.forEach((transaction) => {
    const transactionConnections: FlowConnectionSnapshot[] = [];

    for (let index = 0; index < transaction.steps.length - 1; index += 1) {
      const current = transaction.steps[index];
      const next = transaction.steps[index + 1];

      transactionConnections.push({
        id: createConnectionId(transaction.id, current.id, next.id),
        source: current.id,
        target: next.id,
      });
    }

    connections[transaction.id] = transactionConnections;
  });

  return connections;
};

export const normalizeConnections = (
  script: Script,
  existingConnections?: FlowConnectionMap,
): FlowConnectionMap => {
  const defaults = buildDefaultConnections(script);

  if (!existingConnections) {
    return defaults;
  }

  const normalized: FlowConnectionMap = {};

  script.transactions.forEach((transaction) => {
    normalized[transaction.id] = existingConnections[transaction.id] ?? defaults[transaction.id] ?? [];
  });

  return normalized;
};
