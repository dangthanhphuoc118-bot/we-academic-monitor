export type CambridgePronunciation = "clear" | "unclear";
export type CambridgeBinary = "correct" | "incorrect";

export type CambridgeColumnEvaluation = {
  oneOrMany: CambridgeBinary | "";
  amIsAre: CambridgeBinary | "";
};

export type CambridgeEvaluationMatrix = {
  pronunciation: CambridgePronunciation | "";
  pattern: CambridgeColumnEvaluation;
  free: CambridgeColumnEvaluation;
};

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object"
  ? value as Record<string, unknown>
  : {};

const pronunciation = (value: unknown): CambridgePronunciation | "" =>
  value === "clear" || value === "unclear" ? value : "";

const binary = (value: unknown): CambridgeBinary | "" =>
  value === "correct" || value === "incorrect" ? value : "";

export function normalizeCambridgeEvaluation(value: Record<string, unknown>): CambridgeEvaluationMatrix {
  const pattern = record(value.pattern);
  const free = record(value.free);
  const legacyPronunciation = pronunciation(value.pronunciation);
  const legacyOneOrMany = binary(value.oneOrMany);
  const legacyAmIsAre = binary(value.amIsAre);
  return {
    pronunciation: legacyPronunciation || pronunciation(pattern.pronunciation) || pronunciation(free.pronunciation),
    pattern: {
      oneOrMany: binary(pattern.oneOrMany) || legacyOneOrMany,
      amIsAre: binary(pattern.amIsAre) || legacyAmIsAre,
    },
    free: {
      oneOrMany: binary(free.oneOrMany) || legacyOneOrMany,
      amIsAre: binary(free.amIsAre) || legacyAmIsAre,
    },
  };
}

export function isCompleteCambridgeEvaluation(value: CambridgeEvaluationMatrix) {
  return Boolean(value.pronunciation) && [value.pattern, value.free].every((column) =>
    Boolean(column.oneOrMany && column.amIsAre)
  );
}
