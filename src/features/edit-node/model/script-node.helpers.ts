import type { RequestNode, RequestGroupNode, Script, TransactionStep } from "@/entities/script";
import { createScopedId } from "@/entities/script";

export type EditableScriptNode = TransactionStep | RequestNode;

export interface LocatedScriptNode {
  transactionIndex: number;
  stepIndex: number;
  requestIndex: number | null;
  node: EditableScriptNode;
  container: "transaction-step" | "group-request";
}

export const findLocatedScriptNode = (
  script: Script,
  nodeId: string,
): LocatedScriptNode | null => {
  for (let transactionIndex = 0; transactionIndex < script.transactions.length; transactionIndex += 1) {
    const transaction = script.transactions[transactionIndex];

    for (let stepIndex = 0; stepIndex < transaction.steps.length; stepIndex += 1) {
      const step = transaction.steps[stepIndex];

      if (step.id === nodeId) {
        return {
          transactionIndex,
          stepIndex,
          requestIndex: null,
          node: step,
          container: "transaction-step",
        };
      }

      if (step.type === "request-group") {
        for (let requestIndex = 0; requestIndex < step.requests.length; requestIndex += 1) {
          const request = step.requests[requestIndex];
          if (request.id === nodeId) {
            return {
              transactionIndex,
              stepIndex,
              requestIndex,
              node: request,
              container: "group-request",
            };
          }
        }
      }
    }
  }

  return null;
};

export const replaceLocatedScriptNode = (
  script: Script,
  location: LocatedScriptNode,
  nextNode: EditableScriptNode,
): Script => {
  const transactions = script.transactions.map((transaction, transactionIndex) => {
    if (transactionIndex !== location.transactionIndex) {
      return transaction;
    }

    const steps = transaction.steps.map((step, stepIndex) => {
      if (stepIndex !== location.stepIndex) {
        return step;
      }

      if (location.container === "transaction-step") {
        return nextNode as TransactionStep;
      }

      if (step.type !== "request-group" || location.requestIndex === null) {
        return step;
      }

      return {
        ...step,
        requests: step.requests.map((request, requestIndex) =>
          requestIndex === location.requestIndex ? (nextNode as RequestNode) : request,
        ),
      };
    });

    return {
      ...transaction,
      steps,
    };
  });

  return {
    ...script,
    transactions,
  };
};

export const insertNodeAfterTarget = (
  script: Script,
  targetNodeId: string,
  newNode: TransactionStep | RequestNode,
): Script => {
  const location = findLocatedScriptNode(script, targetNodeId);

  if (!location) {
    return script;
  }

  const transactions = script.transactions.map((transaction, transactionIndex) => {
    if (transactionIndex !== location.transactionIndex) {
      return transaction;
    }

    if (location.container === "transaction-step") {
      const steps = [...transaction.steps];
      steps.splice(location.stepIndex + 1, 0, newNode as TransactionStep);

      return {
        ...transaction,
        steps,
      };
    }

    const steps = transaction.steps.map((step, stepIndex) => {
      if (stepIndex !== location.stepIndex || step.type !== "request-group" || location.requestIndex === null) {
        return step;
      }

      const requests = [...step.requests];
      requests.splice(location.requestIndex + 1, 0, newNode as RequestNode);

      return {
        ...step,
        requests,
      };
    });

    return {
      ...transaction,
      steps,
    };
  });

  return {
    ...script,
    transactions,
  };
};

export const createDefaultDataNode = () => ({
  id: createScopedId("data", String(Date.now())),
  type: "data" as const,
  name: "New Data Node",
  dataType: "string" as const,
  value: "",
  description: "Provide reusable values for later requests.",
});

export const createDefaultRequestNode = () => ({
  id: createScopedId("req", String(Date.now())),
  type: "request" as const,
  name: "New Request",
  method: "GET" as const,
  url: {
    kind: "static" as const,
    value: "/api/resource",
  },
  headers: [],
  queryParams: [],
  pathParams: [],
  description: "Configure an HTTP request.",
});

export const createDefaultRequestGroupNode = (): RequestGroupNode => ({
  id: createScopedId("group", String(Date.now())),
  type: "request-group",
  name: "New Request Group",
  requests: [
    {
      ...createDefaultRequestNode(),
      id: createScopedId("req", `${Date.now()}_child`),
      name: "Grouped Request",
    },
  ],
  description: "Run contained requests in parallel.",
});
