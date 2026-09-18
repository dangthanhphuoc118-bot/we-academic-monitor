import { and, eq, lt } from "drizzle-orm";
import type { getDb } from "../db";
import { learningChecks, studentAssessments, studentCheckQueue } from "../db/schema";
import { addDays, mondayOf, validDate, vietnamToday } from "./weekly-history";

export const STUDENT_HISTORY_WEEKS = 48;

export function studentHistoryWindow(today = vietnamToday()) {
  const currentWeekStart = mondayOf(today);
  const startDate = addDays(currentWeekStart, -(STUDENT_HISTORY_WEEKS - 1) * 7);
  const endExclusive = addDays(currentWeekStart, 7);
  return { startDate, endDate: addDays(endExclusive, -1), endExclusive, currentWeekStart };
}

export function isInStudentHistoryWindow(value: unknown, today = vietnamToday()) {
  if (!validDate(value)) return false;
  const window = studentHistoryWindow(today);
  return value >= window.startDate && value < window.endExclusive;
}

export async function pruneExpiredStudentHistory(db: ReturnType<typeof getDb>, today = vietnamToday()) {
  const { startDate } = studentHistoryWindow(today);
  await db.delete(learningChecks).where(lt(learningChecks.checkedAt, startDate));
  await db.delete(studentAssessments).where(lt(studentAssessments.checkedAt, startDate));
  await db.delete(studentCheckQueue).where(and(eq(studentCheckQueue.status, "completed"), lt(studentCheckQueue.scheduledDate, startDate)));
  return { deletedBefore: startDate };
}
