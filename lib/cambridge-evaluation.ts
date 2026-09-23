export type CambridgePronunciation = "clear" | "unclear";
export type CambridgeBinary = "correct" | "incorrect";

export type CambridgeColumnEvaluation = {
  pronunciation: CambridgePronunciation | "";
  oneOrMany: CambridgeBinary | "";
  amIsAre: CambridgeBinary | "";
};

export type CambridgeEvaluationMatrix = {
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
    pattern: {
      pronunciation: pronunciation(pattern.pronunciation) || legacyPronunciation,
      oneOrMany: binary(pattern.oneOrMany) || legacyOneOrMany,
      amIsAre: binary(pattern.amIsAre) || legacyAmIsAre,
    },
    free: {
      pronunciation: pronunciation(free.pronunciation) || legacyPronunciation,
      oneOrMany: binary(free.oneOrMany) || legacyOneOrMany,
      amIsAre: binary(free.amIsAre) || legacyAmIsAre,
    },
  };
}

export function cambridgeColumnPercent(value: CambridgeColumnEvaluation) {
  const scores = [
    value.pronunciation === "clear" ? 100 : 0,
    value.oneOrMany === "correct" ? 100 : 0,
    value.amIsAre === "correct" ? 100 : 0,
  ];
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function isCompleteCambridgeEvaluation(value: CambridgeEvaluationMatrix) {
  return [value.pattern, value.free].every((column) =>
    Boolean(column.pronunciation && column.oneOrMany && column.amIsAre)
  );
}
