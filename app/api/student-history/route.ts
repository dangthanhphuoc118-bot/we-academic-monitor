import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, learningChecks, studentAssessments, students, studentTracking } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { addDays, mondayOf, validDate, vietnamToday } from "@/lib/weekly-history";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const positiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

export async function GET(request: Request) {
  if (!await getCurrentUser(request)) return fail("Vui lòng đăng nhập.", 401);
  const params = new URL(request.url).searchParams;
  const studentId = positiveId(params.get("studentId"));
  const requestedStart = params.get("startDate");
  if (!studentId || (requestedStart !== null && !validDate(requestedStart))) return fail("Học viên hoặc ngày bắt đầu không hợp lệ.");
  try {
    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    if (!student) return fail("Không tìm thấy học viên.", 404);
    const [tracking, firstCheck, firstLegacy] = await Promise.all([
      db.select().from(studentTracking).where(eq(studentTracking.studentId, studentId)).get(),
      db.select({ date: learningChecks.checkedAt }).from(learningChecks).where(eq(learningChecks.studentId, studentId)).orderBy(asc(learningChecks.checkedAt)).limit(1).get(),
      db.select({ date: studentAssessments.checkedAt }).from(studentAssessments).where(eq(studentAssessments.studentId, studentId)).orderBy(asc(studentAssessments.checkedAt)).limit(1).get(),
    ]);
    const firstDate = [firstCheck?.date, firstLegacy?.date].filter((value): value is string => validDate(value)).sort()[0];
    const startDate = mondayOf(requestedStart || tracking?.startDate || firstDate || vietnamToday());
    const endExclusive = addDays(startDate, 48 * 7);
    // Query by this student and full 48-week range, independent of dashboard row limits.
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
    return Response.json({ studentId, startDate, savedStartDate: tracking?.startDate || null,
      learningChecks: checks.map(({ check, className }) => ({ ...check, className, studentName: student.name })),
      legacy: legacy.map(({ assessment, className }) => ({ ...assessment, className, studentName: student.name })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Không thể tải lịch sử 48 tuần. Kiểm tra kết nối và migration mới nhất.", 500);
  }
}

export async function POST(request: Request) {
  if (!await getCurrentUser(request)) return fail("Phiên đăng nhập đã hết hạn.", 401);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Dữ liệu không hợp lệ."); }
  const studentId = positiveId(body?.studentId);
  if (!studentId || !validDate(body?.startDate)) return fail("Học viên hoặc ngày bắt đầu không hợp lệ.");
  try {
    const db = getDb();
    if (!await db.select({ id: students.id }).from(students).where(eq(students.id, studentId)).get()) return fail("Không tìm thấy học viên.", 404);
    const startDate = mondayOf(body.startDate);
    await db.insert(studentTracking).values({ studentId, startDate }).onConflictDoUpdate({ target: studentTracking.studentId, set: { startDate, updatedAt: new Date().toISOString() } });
    return Response.json({ startDate });
  } catch { return fail("Không thể lưu mốc theo dõi.", 500); }
}
