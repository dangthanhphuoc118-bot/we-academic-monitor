import type { CurriculumUnit } from "./curriculum";

export type EvaluationGroup = { unitNumbers: number[]; label: string; units: CurriculumUnit[] };

export function evaluationGroups(units: CurriculumUnit[]): EvaluationGroup[] {
  const groups: EvaluationGroup[] = [];
  for (const unit of units) {
    const allReviews = unit.group === "baby" && (unit.topic.trim().toLowerCase() === "all reviews" || unit.content.trim().toLowerCase() === "all reviews");
    const existing = allReviews ? groups.find((group) => group.units.every((item) => item.group === "baby" && (item.topic.trim().toLowerCase() === "all reviews" || item.content.trim().toLowerCase() === "all reviews"))) : undefined;
    if (existing) {
      existing.units.push(unit);
      existing.unitNumbers.push(unit.unitNumber);
      existing.label = `All reviews · ${existing.units.map((item) => item.unitLabel).join(", ")}`;
    } else {
      groups.push({ units: [unit], unitNumbers: [unit.unitNumber], label: allReviews ? `All reviews · ${unit.unitLabel}` : unit.unitLabel });
    }
  }
  return groups;
}
