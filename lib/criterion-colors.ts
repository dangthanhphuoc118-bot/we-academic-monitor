export type CriterionTone = "good" | "average" | "redflag";

// Per-criterion colors mirror the stored overall score rules: red thresholds
// depend on the program/criterion, while Good requires strictly above 80%.
export function percentCriterionTone(value: unknown, redBelow: number): CriterionTone | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) return undefined;
  return value < redBelow ? "redflag" : value > 80 ? "good" : "average";
}

export function vocabularyCriterionTone(correct: unknown, max: unknown): CriterionTone | undefined {
  if (typeof correct !== "number" || typeof max !== "number" || !Number.isInteger(correct) || !Number.isInteger(max) || max <= 0 || correct < 0 || correct > max) return undefined;
  return percentCriterionTone(correct / max * 100, 70);
}

export function choiceCriterionTone(value: unknown): CriterionTone | undefined {
  if (value === "clear" || value === "correct") return "good";
  if (value === "unclear" || value === "incorrect") return "redflag";
  return undefined;
}

export const criterionTileClass: Record<CriterionTone, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-900",
  average: "border-amber-200 bg-amber-50 text-amber-950",
  redflag: "border-rose-200 bg-rose-50 text-rose-900",
};

export const criterionCellClass: Record<CriterionTone, string> = {
  good: "bg-emerald-50 text-emerald-900",
  average: "bg-amber-50 text-amber-950",
  redflag: "bg-rose-50 text-rose-900",
};
