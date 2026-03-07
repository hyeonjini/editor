export type ScriptNodePrefix = "script" | "txn" | "req" | "group" | "data";

export const createScopedId = (prefix: ScriptNodePrefix, seed: string): string => {
  return `${prefix}_${seed}`;
};
