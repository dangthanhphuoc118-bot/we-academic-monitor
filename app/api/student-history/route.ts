import { and, desc, eq, gte, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, learningChecks, studentAssessments, students } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pruneExpiredStudentHistory, studentHistoryWindow } from "@/lib/history-retention";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const positiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

export async function GET(request: Request) {
  if (!await getCurrentUser(request)) return fail("Vui lòng đăng nhập.", 401);
  const studentId = positiveId(new URL(request.url).searchParams.get("studentId"));
  if (!studentId) return fail("Học viên không hợp lệ.");

  try {
    const db = getDb();
    const { deletedBefore } = await pruneExpiredStudentHistory(db);
    const { startDate, endDate, endExclusive, currentWeekStart } = studentHistoryWindow();
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    if (!student) return fail("Không tìm thấy học viên.", 404);

    // Query the full rolling window for this student, independent of dashboard row limits.
    const [checks, legacy] = await Promise.all([
      db.select({ check: learningChecks, className: classes.name }).from(learningChecks)
        .leftJoin(classes, eq(learningChecks.classId, classes.id))
        .where(and(eq(learningChecks.studentId, studentId), gte(learningChecks.checkedAt, startDate), lt(learningChecks.checkedAt, endExclusive)))
        .orderBy(desc(learningChecks.checkedAt), desc(learningChecks.id)),
      db.select({ assessment: studentAssessments, className: classes.name }).from(studentAssessments)
        .leftJoin(classes, eq(studentAssessments.classId, classes.id))
        .where(and(eq(studentAssessments.studentId, studentId), gte(studentAssessments.checkedAt, startDate), lt(studentAssessments.checkedAt, endExclusive)))
        .orderBy(desc(studentAssessments.checkedAt), desc(studentAssessments.id)),
    ]);

    return Response.json({
      studentId,
      startDate,
      endDate,
      currentWeekStart,
      deletedBefore,
      learningChecks: checks.map(({ check, className }) => ({ ...check, className, studentName: student.name })),
      legacy: legacy.map(({ assessment, className }) => ({ ...assessment, className, studentName: student.name })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Không thể tải lịch sử 48 tuần. Kiểm tra kết nối và migration mới nhất.", 500);
  }
}

export async function POST(request: Request) {
  if (!await getCurrentUser(request)) return fail("Phiên đăng nhập đã hết hạn.", 401);
  return fail("Mốc 48 tuần được hệ thống tính tự động và không thể thay đổi thủ công.", 405);
}
