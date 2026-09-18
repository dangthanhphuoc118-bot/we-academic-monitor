import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, teacherObservations, teachers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { validateObservationItems } from "@/lib/observation";
import { validDate } from "@/lib/weekly-history";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const positiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

export async function GET(request: Request) {
  if (!await getCurrentUser(request)) return fail("Vui lòng đăng nhập.", 401);
  try {
    const rows = await getDb().select().from(teacherObservations).orderBy(desc(teacherObservations.observedAt), desc(teacherObservations.observedTime), desc(teacherObservations.id));
    return Response.json({ observations: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Không thể tải Observation. Kiểm tra kết nối và migration mới nhất.", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return fail("Phiên đăng nhập đã hết hạn.", 401);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Dữ liệu không hợp lệ."); }
  if (!body || !["create", "update", "delete"].includes(String(body.action))) return fail("Thao tác không hợp lệ.");
  const db = getDb();
  try {
    const id = positiveId(body.id);
    const existing = body.action !== "create" && id ? await db.select().from(teacherObservations).where(eq(teacherObservations.id, id)).get() : undefined;
    if (body.action !== "create" && !existing) return fail("Không tìm thấy phiếu Observation.", 404);
    if (body.action === "delete") {
      await db.delete(teacherObservations).where(eq(teacherObservations.id, existing!.id));
      return Response.json({ ok: true });
    }
    if (!validDate(body.observedAt) || typeof body.observedTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.observedTime)) return fail("Vui lòng nhập ngày và giờ dự giờ hợp lệ.");
    if (body.teacherRole !== "teacher" && body.teacherRole !== "ta") return fail("Vui lòng chọn Teacher hoặc TA.");
    let items;
    try { items = validateObservationItems(body.items); } catch (error) { return fail((error as Error).message); }
    const teacherId = positiveId(body.teacherId);
    const classId = positiveId(body.classId);
    // Archived observations keep their original names even after a teacher/class is removed.
    const teacher = teacherId ? await db.select().from(teachers).where(eq(teachers.id, teacherId)).get() : undefined;
    const classroom = classId ? await db.select().from(classes).where(eq(classes.id, classId)).get() : undefined;
    if (!teacher && !(existing && existing.teacherId === null && body.teacherId === null)) return fail("Vui lòng chọn giáo viên / trợ giảng còn trong danh sách.");
    if (!classroom && !(existing && existing.classId === null && body.classId === null)) return fail("Vui lòng chọn lớp học.");
    const values = {
      teacherId, teacherName: existing && existing.teacherId === teacherId ? existing.teacherName : teacher!.name,
      teacherRole: body.teacherRole, classId, className: existing && existing.classId === classId ? existing.className : classroom!.name,
      observerName: existing?.observerName || user.name || user.email,
      observedAt: body.observedAt, observedTime: body.observedTime, itemsJson: JSON.stringify(items), updatedAt: new Date().toISOString(),
    };
    const row = existing
      ? await db.update(teacherObservations).set(values).where(eq(teacherObservations.id, existing.id)).returning().get()
      : await db.insert(teacherObservations).values(values).returning().get();
    return Response.json({ observation: row });
  } catch {
    return fail("Không thể lưu Observation. Vui lòng thử lại và kiểm tra migration mới nhất.", 500);
  }
}
