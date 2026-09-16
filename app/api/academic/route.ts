import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  classes,
  criteria,
  curriculumOverrides,
  levelOptions,
  learningChecks,
  studentCheckQueue,
  studentAssessmentItems,
  studentAssessments,
  students,
  studentFeedbackOptions,
  teacherReviewItems,
  teacherReviews,
  teachers,
} from "@/db/schema";
import { curriculumDefaults, curriculumKey, programs } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";

type ScoreItem = { criterionId: number; score: number; note?: string };

const now = () => new Date().toISOString();
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const id = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

function fail(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function messageFor(error: unknown) {
  const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
  if (message.includes("no such table")) {
    return "Dữ liệu chưa được khởi tạo. Vui lòng xuất bản lại phiên bản có cơ sở dữ liệu.";
  }
  if (message.includes("UNIQUE constraint failed")) {
    return "Tên hoặc nội dung này đã tồn tại. Vui lòng nhập giá trị khác.";
  }
  if (message.includes("FOREIGN KEY constraint failed")) {
    return "Không thể thực hiện vì dữ liệu đang được sử dụng ở nơi khác.";
  }
  return message;
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return fail("Vui lòng đăng nhập để tiếp tục.", 401);
    const db = getDb();
    const [classRows, studentRows, teacherRows, criterionRows, assessmentRows, reviewRows, overrideRows, learningCheckRows, levelRows, feedbackRows, queueRows] =
      await Promise.all([
        db
          .select({
            id: classes.id,
            name: classes.name,
            level: classes.level,
            schedule: classes.schedule,
            room: classes.room,
            teacherId: classes.teacherId,
            teacherName: teachers.name,
            status: classes.status,
            studentCount: count(students.id),
          })
          .from(classes)
          .leftJoin(teachers, eq(classes.teacherId, teachers.id))
          .leftJoin(students, eq(students.classId, classes.id))
          .groupBy(classes.id)
          .orderBy(asc(classes.name)),
        db
          .select({
            id: students.id,
            name: students.name,
            classId: students.classId,
            className: classes.name,
            level: students.level,
            guardianPhone: students.guardianPhone,
            status: students.status,
            note: students.note,
          })
          .from(students)
          .leftJoin(classes, eq(students.classId, classes.id))
          .orderBy(asc(students.name)),
        db
          .select({
            id: teachers.id,
            name: teachers.name,
            email: teachers.email,
            phone: teachers.phone,
            specialization: teachers.specialization,
            status: teachers.status,
            note: teachers.note,
            classCount: count(classes.id),
          })
          .from(teachers)
          .leftJoin(classes, eq(classes.teacherId, teachers.id))
          .groupBy(teachers.id)
          .orderBy(asc(teachers.name)),
        db.select().from(criteria).orderBy(asc(criteria.targetType), asc(criteria.sortOrder), asc(criteria.id)),
        db
          .select({
            id: studentAssessments.id,
            studentId: studentAssessments.studentId,
            studentName: students.name,
            classId: studentAssessments.classId,
            className: classes.name,
            evaluatorName: studentAssessments.evaluatorName,
            overallScore: studentAssessments.overallScore,
            result: studentAssessments.result,
            summary: studentAssessments.summary,
            actionPlan: studentAssessments.actionPlan,
            checkedAt: studentAssessments.checkedAt,
          })
          .from(studentAssessments)
          .innerJoin(students, eq(studentAssessments.studentId, students.id))
          .leftJoin(classes, eq(studentAssessments.classId, classes.id))
          .orderBy(desc(studentAssessments.checkedAt), desc(studentAssessments.id))
          .limit(200),
        db
          .select({
            id: teacherReviews.id,
            teacherId: teacherReviews.teacherId,
            teacherName: teachers.name,
            reviewerName: teacherReviews.reviewerName,
            overallScore: teacherReviews.overallScore,
            result: teacherReviews.result,
            summary: teacherReviews.summary,
            actionPlan: teacherReviews.actionPlan,
            observedAt: teacherReviews.observedAt,
          })
          .from(teacherReviews)
          .innerJoin(teachers, eq(teacherReviews.teacherId, teachers.id))
          .orderBy(desc(teacherReviews.observedAt), desc(teacherReviews.id))
          .limit(200),
        db.select().from(curriculumOverrides),
        db
          .select({
            id: learningChecks.id,
            studentId: learningChecks.studentId,
            studentName: students.name,
            classId: learningChecks.classId,
            className: classes.name,
            programCode: learningChecks.programCode,
            programLabel: learningChecks.programLabel,
            unitNumber: learningChecks.unitNumber,
            unitLabel: learningChecks.unitLabel,
            teacherName: learningChecks.teacherName,
            checkedAt: learningChecks.checkedAt,
            evaluationJson: learningChecks.evaluationJson,
            overallScore: learningChecks.overallScore,
            result: learningChecks.result,
            feedbackJson: learningChecks.feedbackJson,
            notes: learningChecks.notes,
            actionPlan: learningChecks.actionPlan,
          })
          .from(learningChecks)
          .innerJoin(students, eq(learningChecks.studentId, students.id))
          .leftJoin(classes, eq(learningChecks.classId, classes.id))
          .orderBy(desc(learningChecks.checkedAt), desc(learningChecks.id))
          .limit(300),
        db.select().from(levelOptions).orderBy(asc(levelOptions.sortOrder), asc(levelOptions.id)),
        db.select().from(studentFeedbackOptions).orderBy(asc(studentFeedbackOptions.sortOrder), asc(studentFeedbackOptions.id)),
        db
          .select({
            id: studentCheckQueue.id,
            studentId: studentCheckQueue.studentId,
            studentName: students.name,
            classId: studentCheckQueue.classId,
            className: classes.name,
            level: students.level,
            scheduledDate: studentCheckQueue.scheduledDate,
            status: studentCheckQueue.status,
            createdBy: studentCheckQueue.createdBy,
            completedAt: studentCheckQueue.completedAt,
          })
          .from(studentCheckQueue)
          .innerJoin(students, eq(studentCheckQueue.studentId, students.id))
          .leftJoin(classes, eq(studentCheckQueue.classId, classes.id))
          .orderBy(desc(studentCheckQueue.scheduledDate), asc(classes.name), asc(students.name))
          .limit(500),
      ]);

    const overrides = new Map(
      overrideRows.map((row) => [curriculumKey(row.programCode, row.unitNumber), row])
    );
    const programLabels = new Map(
      levelRows
        .filter((row) => row.programCode)
        .map((row) => [row.programCode, row.label])
    );
    const curriculum = curriculumDefaults.map((unit) => {
      const override = overrides.get(curriculumKey(unit.programCode, unit.unitNumber));
      const merged = override
        ? {
            ...unit,
            topic: override.topic,
            content: override.content,
            vocabulary: override.vocabulary,
            grammar: override.grammar,
            vocabularyMax: override.vocabularyMax,
            writingRef: override.writingRef,
            isOverride: true,
          }
        : unit;
      return {
        ...merged,
        programLabel: programLabels.get(unit.programCode) || merged.programLabel,
      };
    });

    return Response.json({
      classes: classRows.map((row) => ({ ...row, studentCount: Number(row.studentCount) })),
      students: studentRows,
      teachers: teacherRows.map((row) => ({ ...row, classCount: Number(row.classCount) })),
      criteria: criterionRows,
      studentAssessments: assessmentRows,
      teacherReviews: reviewRows,
      curriculum,
      learningChecks: learningCheckRows,
      levelOptions: levelRows,
      feedbackOptions: feedbackRows,
      checkQueue: queueRows,
    });
  } catch (error) {
    return fail(messageFor(error), 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = text(body.action);
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return fail("Phiên đăng nhập đã hết hạn.", 401);
    const actorName = currentUser.name || currentUser.email;
    const db = getDb();

    if (action === "createLevelOption" || action === "updateLevelOption") {
      const label = text(body.label);
      const programCode = text(body.programCode);
      if (!label) return fail("Vui lòng nhập tên chương trình hoặc trình độ.");
      if (programCode && !programs.some((item) => item.code === programCode)) {
        return fail("Khung chương trình liên kết không hợp lệ.");
      }
      const values = {
        label,
        programCode,
        active: body.active === false || body.active === 0 ? 0 : 1,
        sortOrder: Number(body.sortOrder) || 0,
        updatedAt: now(),
      };
      if (action === "createLevelOption") {
        const [row] = await db.insert(levelOptions).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Chương trình hoặc trình độ không hợp lệ.");
      const [current] = await db.select().from(levelOptions).where(eq(levelOptions.id, itemId)).limit(1);
      if (!current) return fail("Không tìm thấy chương trình hoặc trình độ.", 404);
      const [row] = await db.update(levelOptions).set(values).where(eq(levelOptions.id, itemId)).returning();
      if (current.label !== label) {
        await db.update(classes).set({ level: label, updatedAt: now() }).where(eq(classes.level, current.label));
        await db.update(students).set({ level: label, updatedAt: now() }).where(eq(students.level, current.label));
      }
      return Response.json({ item: row });
    }

    if (action === "deleteLevelOption") {
      const itemId = id(body.id);
      if (!itemId) return fail("Chương trình hoặc trình độ không hợp lệ.");
      const [current] = await db.select().from(levelOptions).where(eq(levelOptions.id, itemId)).limit(1);
      if (!current) return fail("Không tìm thấy chương trình hoặc trình độ.", 404);
      const [classUse] = await db.select({ total: count() }).from(classes).where(eq(classes.level, current.label));
      const [studentUse] = await db.select({ total: count() }).from(students).where(eq(students.level, current.label));
      if (Number(classUse.total) + Number(studentUse.total) > 0) {
        return fail("Trình độ đang được sử dụng. Hãy chuyển sang trạng thái tạm ẩn thay vì xóa.", 409);
      }
      await db.delete(levelOptions).where(eq(levelOptions.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createFeedbackOption" || action === "updateFeedbackOption") {
      const label = text(body.label);
      if (!label) return fail("Vui lòng nhập nội dung nhận xét.");
      const values = {
        category: text(body.category) || "Nhận xét chung",
        label,
        active: body.active === false || body.active === 0 ? 0 : 1,
        sortOrder: Number(body.sortOrder) || 0,
        updatedAt: now(),
      };
      if (action === "createFeedbackOption") {
        const [row] = await db.insert(studentFeedbackOptions).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Mẫu nhận xét không hợp lệ.");
      const [row] = await db.update(studentFeedbackOptions).set(values).where(eq(studentFeedbackOptions.id, itemId)).returning();
      return Response.json({ item: row });
    }

    if (action === "deleteFeedbackOption") {
      const itemId = id(body.id);
      if (!itemId) return fail("Mẫu nhận xét không hợp lệ.");
      await db.delete(studentFeedbackOptions).where(eq(studentFeedbackOptions.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "updateCurriculumUnit") {
      const programCode = text(body.programCode);
      const unitNumber = id(body.unitNumber);
      const sourceUnit = curriculumDefaults.find(
        (unit) => unit.programCode === programCode && unit.unitNumber === unitNumber
      );
      if (!sourceUnit || !unitNumber) return fail("Nội dung chương trình không hợp lệ.");
      const values = {
        programCode,
        unitNumber,
        topic: text(body.topic),
        content: text(body.content),
        vocabulary: text(body.vocabulary),
        grammar: text(body.grammar),
        vocabularyMax: Math.max(0, Number(body.vocabularyMax) || 0),
        writingRef: text(body.writingRef),
        updatedAt: now(),
      };
      const [row] = await db
        .insert(curriculumOverrides)
        .values(values)
        .onConflictDoUpdate({
          target: [curriculumOverrides.programCode, curriculumOverrides.unitNumber],
          set: values,
        })
        .returning();
      return Response.json({ item: row });
    }

    if (action === "resetCurriculumUnit") {
      const programCode = text(body.programCode);
      const unitNumber = id(body.unitNumber);
      if (!programCode || !unitNumber) return fail("Nội dung chương trình không hợp lệ.");
      await db
        .delete(curriculumOverrides)
        .where(
          and(
            eq(curriculumOverrides.programCode, programCode),
            eq(curriculumOverrides.unitNumber, unitNumber)
          )
        );
      return Response.json({ ok: true });
    }

    if (action === "scheduleStudentChecks") {
      const classId = id(body.classId);
      const scheduledDate = text(body.scheduledDate);
      const studentIds = Array.isArray(body.studentIds)
        ? Array.from(new Set(body.studentIds.map(id).filter((value): value is number => Boolean(value))))
        : [];
      if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !studentIds.length) {
        return fail("Vui lòng chọn lớp, ngày kiểm tra và ít nhất một học viên.");
      }
      const eligibleStudents = await db
        .select({ id: students.id, classId: students.classId })
        .from(students)
        .where(inArray(students.id, studentIds));
      if (
        eligibleStudents.length !== studentIds.length ||
        eligibleStudents.some((student) => student.classId !== classId)
      ) {
        return fail("Danh sách học viên không khớp với lớp đã chọn.");
      }
      const timestamp = now();
      await db.batch([
        db
          .delete(studentCheckQueue)
          .where(
            and(
              eq(studentCheckQueue.classId, classId),
              eq(studentCheckQueue.scheduledDate, scheduledDate),
              eq(studentCheckQueue.status, "pending")
            )
          ),
        db
          .insert(studentCheckQueue)
          .values(
            studentIds.map((studentId) => ({
              studentId,
              classId,
              scheduledDate,
              status: "pending",
              createdBy: actorName,
              completedAt: null,
              updatedAt: timestamp,
            }))
          )
          .onConflictDoUpdate({
            target: [studentCheckQueue.studentId, studentCheckQueue.scheduledDate],
            set: {
              classId,
              status: "pending",
              createdBy: actorName,
              completedAt: null,
              updatedAt: timestamp,
            },
          }),
      ]);
      return Response.json({ ok: true, scheduled: studentIds.length }, { status: 201 });
    }

    if (action === "removeStudentCheck") {
      const itemId = id(body.id);
      if (!itemId) return fail("Lịch kiểm tra không hợp lệ.");
      await db.delete(studentCheckQueue).where(eq(studentCheckQueue.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createLearningCheck") {
      const studentId = id(body.studentId);
      const programCode = text(body.programCode);
      const unitNumber = id(body.unitNumber);
      const checkedAt = text(body.checkedAt);
      const evaluation =
        body.evaluation && typeof body.evaluation === "object"
          ? (body.evaluation as Record<string, unknown>)
          : {};
      const feedback = Array.isArray(body.feedback)
        ? body.feedback.map(text).filter(Boolean).slice(0, 30)
        : [];
      if (!studentId || !programCode || !unitNumber || !checkedAt) {
        return fail("Vui lòng chọn học viên, nội dung kiểm tra và ngày đánh giá.");
      }

      const program = programs.find((item) => item.code === programCode);
      const defaultUnit = curriculumDefaults.find(
        (unit) => unit.programCode === programCode && unit.unitNumber === unitNumber
      );
      if (!program || !defaultUnit) return fail("Chương trình hoặc unit không hợp lệ.");

      const [student] = await db
        .select({ classId: students.classId, level: students.level })
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);
      if (!student) return fail("Không tìm thấy học viên.", 404);

      const [override] = await db
        .select()
        .from(curriculumOverrides)
        .where(
          and(
            eq(curriculumOverrides.programCode, programCode),
            eq(curriculumOverrides.unitNumber, unitNumber)
          )
        )
        .limit(1);
      const unit = override
        ? {
            ...defaultUnit,
            topic: override.topic,
            vocabularyMax: override.vocabularyMax,
          }
        : defaultUnit;

      const clampPercent = (value: unknown) =>
        Math.min(100, Math.max(0, Number(value) || 0));
      let componentPercentages: number[] = [];
      let hasRedflagComponent = false;

      if (program.group === "baby") {
        const spellingPercent = clampPercent(evaluation.spellingPercent);
        const writingPercent = clampPercent(evaluation.writingPercent);
        const oneOrMany = text(evaluation.oneOrMany);
        const amIsAre = text(evaluation.amIsAre);
        if (!["correct", "incorrect"].includes(oneOrMany) || !["correct", "incorrect"].includes(amIsAre)) {
          return fail("Vui lòng đánh giá đủ One or Many và Am – is – are.");
        }
        componentPercentages = [spellingPercent, writingPercent];
        hasRedflagComponent = spellingPercent < 50 || writingPercent < 50;
      } else if (program.group === "super") {
        const vocabularyMax = Math.max(1, unit.vocabularyMax || 1);
        const vocabularyCorrect = Math.min(
          vocabularyMax,
          Math.max(0, Number(evaluation.vocabularyCorrect) || 0)
        );
        const pronunciation = text(evaluation.pronunciation);
        if (!['clear', 'unclear'].includes(pronunciation)) {
          return fail("Vui lòng chọn kết quả phát âm Clear hoặc Unclear.");
        }
        const vocabularyPercent = (vocabularyCorrect / vocabularyMax) * 100;
        const communicationPercent = clampPercent(evaluation.communicationPercent);
        componentPercentages = [vocabularyPercent, communicationPercent];
        hasRedflagComponent = vocabularyPercent < 70 || communicationPercent < 60;
      } else {
        const pronunciation = text(evaluation.pronunciation);
        if (!['clear', 'unclear'].includes(pronunciation)) {
          return fail("Vui lòng chọn kết quả phát âm Clear hoặc Unclear.");
        }
        const oneOrMany = text(evaluation.oneOrMany);
        const amIsAre = text(evaluation.amIsAre);
        if (!["correct", "incorrect"].includes(oneOrMany) || !["correct", "incorrect"].includes(amIsAre)) {
          return fail("Vui lòng đánh giá đủ One or Many và Am – is – are.");
        }
        const patternPercent = clampPercent(evaluation.patternPercent);
        const freestylePercent = clampPercent(evaluation.freestylePercent);
        componentPercentages = [patternPercent, freestylePercent];
        hasRedflagComponent = patternPercent < 60 || freestylePercent < 60;
      }

      const overallPercent =
        componentPercentages.reduce((sum, value) => sum + value, 0) /
        componentPercentages.length;
      const overallScore = Math.round((overallPercent / 20) * 100) / 100;
      const result = hasRedflagComponent
        ? "Redflag"
        : overallPercent > 80
          ? "Good"
          : "Average";

      const [row] = await db
        .insert(learningChecks)
        .values({
          studentId,
          classId: student.classId,
          programCode,
          programLabel: student.level || program.label,
          unitNumber,
          unitLabel: defaultUnit.unitLabel,
          teacherName: actorName,
          checkedAt,
          evaluationJson: JSON.stringify(evaluation),
          overallScore,
          result,
          feedbackJson: JSON.stringify(feedback),
          notes: text(body.notes),
          actionPlan: "",
        })
        .returning();
      await db
        .update(studentCheckQueue)
        .set({ status: "completed", completedAt: now(), updatedAt: now() })
        .where(
          and(
            eq(studentCheckQueue.studentId, studentId),
            eq(studentCheckQueue.scheduledDate, checkedAt)
          )
        );
      return Response.json({ item: row }, { status: 201 });
    }

    if (action === "deleteLearningCheck") {
      const itemId = id(body.id);
      if (!itemId) return fail("Bản đánh giá không hợp lệ.");
      await db.delete(learningChecks).where(eq(learningChecks.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createClass" || action === "updateClass") {
      const name = text(body.name);
      const level = text(body.level);
      if (!name || !level) return fail("Vui lòng nhập tên lớp và trình độ.");
      const values = {
        name,
        level,
        schedule: text(body.schedule),
        room: text(body.room),
        teacherId: id(body.teacherId),
        status: text(body.status) || "active",
        updatedAt: now(),
      };
      if (action === "createClass") {
        const [row] = await db.insert(classes).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Lớp không hợp lệ.");
      const [row] = await db.update(classes).set(values).where(eq(classes.id, itemId)).returning();
      return Response.json({ item: row });
    }

    if (action === "deleteClass") {
      const itemId = id(body.id);
      if (!itemId) return fail("Lớp không hợp lệ.");
      const [usage] = await db.select({ total: count() }).from(students).where(eq(students.classId, itemId));
      if (Number(usage.total) > 0) return fail("Hãy chuyển hoặc xóa học viên khỏi lớp trước.", 409);
      await db.delete(classes).where(eq(classes.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createStudent" || action === "updateStudent") {
      const name = text(body.name);
      const level = text(body.level);
      if (!name || !level) return fail("Vui lòng nhập họ tên và trình độ học viên.");
      const values = {
        name,
        classId: id(body.classId),
        level,
        guardianPhone: text(body.guardianPhone),
        status: text(body.status) || "active",
        note: text(body.note),
        updatedAt: now(),
      };
      if (action === "createStudent") {
        const [row] = await db.insert(students).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Học viên không hợp lệ.");
      const [row] = await db.update(students).set(values).where(eq(students.id, itemId)).returning();
      return Response.json({ item: row });
    }

    if (action === "deleteStudent") {
      const itemId = id(body.id);
      if (!itemId) return fail("Học viên không hợp lệ.");
      await db.delete(students).where(eq(students.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createTeacher" || action === "updateTeacher") {
      const name = text(body.name);
      if (!name) return fail("Vui lòng nhập họ tên giáo viên.");
      const values = {
        name,
        email: text(body.email),
        phone: text(body.phone),
        specialization: text(body.specialization),
        status: text(body.status) || "active",
        note: text(body.note),
        updatedAt: now(),
      };
      if (action === "createTeacher") {
        const [row] = await db.insert(teachers).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Giáo viên không hợp lệ.");
      const [row] = await db.update(teachers).set(values).where(eq(teachers.id, itemId)).returning();
      return Response.json({ item: row });
    }

    if (action === "deleteTeacher") {
      const itemId = id(body.id);
      if (!itemId) return fail("Giáo viên không hợp lệ.");
      const [usage] = await db.select({ total: count() }).from(classes).where(eq(classes.teacherId, itemId));
      if (Number(usage.total) > 0) return fail("Hãy bỏ phân công giáo viên khỏi các lớp trước.", 409);
      await db.delete(teachers).where(eq(teachers.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createCriterion" || action === "updateCriterion") {
      const targetType = text(body.targetType);
      const category = text(body.category);
      const title = text(body.title);
      if (!['student', 'teacher'].includes(targetType) || !category || !title) {
        return fail("Vui lòng nhập đúng đối tượng, nhóm và nội dung đánh giá.");
      }
      const values = {
        targetType,
        level: targetType === "teacher" ? "ALL" : text(body.level) || "ALL",
        category,
        title,
        description: text(body.description),
        weight: Math.min(5, Math.max(1, Number(body.weight) || 1)),
        active: body.active === false || body.active === 0 ? 0 : 1,
        sortOrder: Number(body.sortOrder) || 0,
      };
      if (action === "createCriterion") {
        const [row] = await db.insert(criteria).values(values).returning();
        return Response.json({ item: row }, { status: 201 });
      }
      const itemId = id(body.id);
      if (!itemId) return fail("Tiêu chí không hợp lệ.");
      const [row] = await db.update(criteria).set(values).where(eq(criteria.id, itemId)).returning();
      return Response.json({ item: row });
    }

    if (action === "deleteCriterion") {
      const itemId = id(body.id);
      if (!itemId) return fail("Tiêu chí không hợp lệ.");
      const [studentUse] = await db.select({ total: count() }).from(studentAssessmentItems).where(eq(studentAssessmentItems.criterionId, itemId));
      const [teacherUse] = await db.select({ total: count() }).from(teacherReviewItems).where(eq(teacherReviewItems.criterionId, itemId));
      if (Number(studentUse.total) + Number(teacherUse.total) > 0) {
        return fail("Tiêu chí đã có trong lịch sử đánh giá. Hãy chuyển sang trạng thái tạm ẩn.", 409);
      }
      await db.delete(criteria).where(eq(criteria.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "seedDefaultCriteria") {
      const [existing] = await db.select({ total: count() }).from(criteria);
      if (Number(existing.total) > 0) return fail("Bộ tiêu chí đã có dữ liệu.", 409);
      await db.insert(criteria).values([
        { targetType: "student", level: "ALL", category: "Thái độ", title: "Chuyên cần và đúng giờ", description: "Đi học đều, đúng giờ và chuẩn bị đầy đủ.", weight: 2, sortOrder: 10 },
        { targetType: "student", level: "ALL", category: "Tương tác", title: "Mức độ tham gia trên lớp", description: "Chủ động trả lời, trao đổi và hợp tác.", weight: 2, sortOrder: 20 },
        { targetType: "student", level: "ALL", category: "Năng lực", title: "Mức độ nắm bài", description: "Hiểu và vận dụng được nội dung đang học.", weight: 3, sortOrder: 30 },
        { targetType: "student", level: "ALL", category: "Bài tập", title: "Hoàn thành bài tập", description: "Đủ bài, đúng hạn và có tiến bộ.", weight: 2, sortOrder: 40 },
        { targetType: "student", level: "ALL", category: "Kỹ năng", title: "Phản xạ và sử dụng tiếng Anh", description: "Sử dụng tiếng Anh phù hợp với trình độ hiện tại.", weight: 3, sortOrder: 50 },
        { targetType: "teacher", level: "ALL", category: "Chuyên môn", title: "Chuẩn bị và mục tiêu bài học", description: "Kế hoạch rõ ràng, mục tiêu phù hợp với lớp.", weight: 3, sortOrder: 10 },
        { targetType: "teacher", level: "ALL", category: "Giảng dạy", title: "Phương pháp và hướng dẫn", description: "Giải thích rõ, hoạt động phù hợp và có kiểm tra mức hiểu.", weight: 3, sortOrder: 20 },
        { targetType: "teacher", level: "ALL", category: "Quản lý lớp", title: "Nhịp độ và kỷ luật lớp", description: "Quản lý thời gian, không khí và hành vi học tập.", weight: 2, sortOrder: 30 },
        { targetType: "teacher", level: "ALL", category: "Tương tác", title: "Mức độ tham gia của học viên", description: "Tạo cơ hội để học viên thực hành và nhận phản hồi.", weight: 3, sortOrder: 40 },
        { targetType: "teacher", level: "ALL", category: "Theo dõi", title: "Ghi nhận và báo cáo sau buổi học", description: "Cập nhật tình hình và đề xuất hỗ trợ kịp thời.", weight: 2, sortOrder: 50 },
      ]);
      return Response.json({ ok: true }, { status: 201 });
    }

    if (action === "createStudentAssessment") {
      const studentId = id(body.studentId);
      const checkedAt = text(body.checkedAt);
      const items = Array.isArray(body.items) ? (body.items as ScoreItem[]) : [];
      if (!studentId || !checkedAt || !items.length) {
        return fail("Vui lòng chọn học viên, ngày kiểm tra và chấm đủ tiêu chí.");
      }
      const criterionIds = items.map((item) => id(item.criterionId)).filter((value): value is number => Boolean(value));
      const criterionRows = await db.select({ id: criteria.id, weight: criteria.weight }).from(criteria).where(and(eq(criteria.targetType, "student"), inArray(criteria.id, criterionIds)));
      if (criterionRows.length !== items.length) return fail("Bộ tiêu chí không hợp lệ hoặc đã thay đổi.");
      const weights = new Map(criterionRows.map((row) => [row.id, row.weight]));
      const weighted = items.reduce((sum, item) => sum + Math.min(5, Math.max(1, Number(item.score))) * (weights.get(item.criterionId) || 1), 0);
      const totalWeight = items.reduce((sum, item) => sum + (weights.get(item.criterionId) || 1), 0);
      const overallScore = Math.round((weighted / totalWeight) * 100) / 100;
      const result = overallScore >= 4 ? "Tốt" : overallScore >= 3 ? "Đạt" : overallScore >= 2 ? "Cần theo dõi" : "Cần hỗ trợ";
      const [student] = await db.select({ classId: students.classId }).from(students).where(eq(students.id, studentId)).limit(1);
      if (!student) return fail("Không tìm thấy học viên.", 404);
      const [assessment] = await db.insert(studentAssessments).values({
        studentId,
        classId: student.classId,
        evaluatorName: actorName,
        overallScore,
        result,
        summary: text(body.summary),
        actionPlan: text(body.actionPlan),
        checkedAt,
      }).returning();
      await db.insert(studentAssessmentItems).values(items.map((item) => ({
        assessmentId: assessment.id,
        criterionId: item.criterionId,
        score: Math.min(5, Math.max(1, Number(item.score))),
        note: text(item.note),
      })));
      return Response.json({ item: assessment }, { status: 201 });
    }

    if (action === "deleteStudentAssessment") {
      const itemId = id(body.id);
      if (!itemId) return fail("Bản đánh giá không hợp lệ.");
      await db.delete(studentAssessments).where(eq(studentAssessments.id, itemId));
      return Response.json({ ok: true });
    }

    if (action === "createTeacherReview") {
      const teacherId = id(body.teacherId);
      const observedAt = text(body.observedAt);
      const items = Array.isArray(body.items) ? (body.items as ScoreItem[]) : [];
      if (!teacherId || !observedAt || !items.length) {
        return fail("Vui lòng chọn giáo viên, ngày dự giờ và chấm đủ tiêu chí.");
      }
      const criterionIds = items.map((item) => id(item.criterionId)).filter((value): value is number => Boolean(value));
      const criterionRows = await db.select({ id: criteria.id, weight: criteria.weight }).from(criteria).where(and(eq(criteria.targetType, "teacher"), inArray(criteria.id, criterionIds)));
      if (criterionRows.length !== items.length) return fail("Bộ tiêu chí giáo viên không hợp lệ hoặc đã thay đổi.");
      const weights = new Map(criterionRows.map((row) => [row.id, row.weight]));
      const weighted = items.reduce((sum, item) => sum + Math.min(5, Math.max(1, Number(item.score))) * (weights.get(item.criterionId) || 1), 0);
      const totalWeight = items.reduce((sum, item) => sum + (weights.get(item.criterionId) || 1), 0);
      const overallScore = Math.round((weighted / totalWeight) * 100) / 100;
      const result = overallScore >= 4 ? "Tốt" : overallScore >= 3 ? "Đạt" : overallScore >= 2 ? "Cần theo dõi" : "Cần hỗ trợ";
      const [review] = await db.insert(teacherReviews).values({
        teacherId,
        reviewerName: actorName,
        overallScore,
        result,
        summary: text(body.summary),
        actionPlan: text(body.actionPlan),
        observedAt,
      }).returning();
      await db.insert(teacherReviewItems).values(items.map((item) => ({
        reviewId: review.id,
        criterionId: item.criterionId,
        score: Math.min(5, Math.max(1, Number(item.score))),
        note: text(item.note),
      })));
      return Response.json({ item: review }, { status: 201 });
    }

    if (action === "deleteTeacherReview") {
      const itemId = id(body.id);
      if (!itemId) return fail("Bản đánh giá không hợp lệ.");
      await db.delete(teacherReviews).where(eq(teacherReviews.id, itemId));
      return Response.json({ ok: true });
    }

    return fail("Tác vụ không được hỗ trợ.", 404);
  } catch (error) {
    return fail(messageFor(error), 500);
  }
}
