import type { FlowConnectionSnapshot } from "@/widgets/editor-canvas/model/flow-connection";

export interface ConnectionValidationResult {
  valid: boolean;
  reason: string | null;
}

const buildAdjacency = (connections: FlowConnectionSnapshot[]): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>();

  connections.forEach((connection) => {
    const list = adjacency.get(connection.source) ?? [];
    list.push(connection.target);
    adjacency.set(connection.source, list);
  });

  return adjacency;
};

const hasPath = (
  adjacency: Map<string, string[]>,
  start: string,
  target: string,
  visited = new Set<string>(),
): boolean => {
  if (start === target) {
    return true;
  }

  if (visited.has(start)) {
    return false;
  }

  visited.add(start);

  const neighbors = adjacency.get(start) ?? [];
  return neighbors.some((neighbor) => hasPath(adjacency, neighbor, target, visited));
};

export const validateConnection = ({
  source,
  target,
  existingConnections,
  visibleNodeIds,
}: {
  source: string;
  target: string;
  existingConnections: FlowConnectionSnapshot[];
  visibleNodeIds: Set<string>;
}): ConnectionValidationResult => {
  if (!visibleNodeIds.has(source) || !visibleNodeIds.has(target)) {
    return { valid: false, reason: "Visible nodes within the current transaction only." };
  }

  if (source === target) {
    return { valid: false, reason: "A node cannot connect to itself." };
  }

  if (existingConnections.some((connection) => connection.source === source && connection.target === target)) {
    return { valid: false, reason: "This connection already exists." };
  }

  const nextConnections = [...existingConnections, { id: `draft:${source}->${target}`, source, target }];
  const adjacency = buildAdjacency(nextConnections);

  if (hasPath(adjacency, target, source)) {
    return { valid: false, reason: "This connection would create a cycle." };
  }

  return { valid: true, reason: null };
};
