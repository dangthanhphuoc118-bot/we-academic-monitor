export type StudentGrading = { customGrading: boolean | number; redflagBelow: number; goodFrom: number };
export type ResultLevel = "Good" | "Average" | "Redflag";

export function validStudentGrading(redflagBelow: unknown, goodFrom: unknown): boolean {
  return typeof redflagBelow === "number" && typeof goodFrom === "number" &&
    Number.isInteger(redflagBelow) && Number.isInteger(goodFrom) &&
    redflagBelow >= 0 && redflagBelow < goodFrom && goodFrom <= 100;
}

export function personalizedResult(percent: number, grading: StudentGrading): ResultLevel {
  return percent < grading.redflagBelow ? "Redflag" : percent >= grading.goodFrom ? "Good" : "Average";
}

export function studentResult(score: number, storedResult: string, grading?: StudentGrading): string {
  if (grading?.customGrading && validStudentGrading(grading.redflagBelow, grading.goodFrom)) {
    return personalizedResult(score * 20, grading);
  }
  return storedResult;
}
