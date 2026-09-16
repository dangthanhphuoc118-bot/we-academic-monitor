import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const teachers = sqliteTable(
  "teachers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    specialization: text("specialization").notNull().default(""),
    status: text("status").notNull().default("active"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_teachers_status").on(table.status)]
);

export const classes = sqliteTable(
  "classes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    level: text("level").notNull(),
    schedule: text("schedule").notNull().default(""),
    room: text("room").notNull().default(""),
    teacherId: integer("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_classes_name_unique").on(table.name),
    index("idx_classes_teacher_id").on(table.teacherId),
    index("idx_classes_status").on(table.status),
  ]
);

export const students = sqliteTable(
  "students",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    classId: integer("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    level: text("level").notNull(),
    guardianPhone: text("guardian_phone").notNull().default(""),
    status: text("status").notNull().default("active"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_students_class_id").on(table.classId),
    index("idx_students_level_status").on(table.level, table.status),
  ]
);

export const criteria = sqliteTable(
  "criteria",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    targetType: text("target_type").notNull(),
    level: text("level").notNull().default("ALL"),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    weight: integer("weight").notNull().default(1),
    active: integer("active").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_criteria_target_level_active").on(
      table.targetType,
      table.level,
      table.active
    ),
  ]
);

export const studentAssessments = sqliteTable(
  "student_assessments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: integer("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    evaluatorName: text("evaluator_name").notNull(),
    overallScore: real("overall_score").notNull(),
    result: text("result").notNull(),
    summary: text("summary").notNull().default(""),
    actionPlan: text("action_plan").notNull().default(""),
    checkedAt: text("checked_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_student_assessments_student_date").on(
      table.studentId,
      table.checkedAt
    ),
    index("idx_student_assessments_result").on(table.result),
  ]
);

export const studentAssessmentItems = sqliteTable(
  "student_assessment_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => studentAssessments.id, { onDelete: "cascade" }),
    criterionId: integer("criterion_id")
      .notNull()
      .references(() => criteria.id, { onDelete: "restrict" }),
    score: integer("score").notNull(),
    note: text("note").notNull().default(""),
  },
  (table) => [
    index("idx_student_items_assessment_id").on(table.assessmentId),
  ]
);

export const teacherReviews = sqliteTable(
  "teacher_reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    reviewerName: text("reviewer_name").notNull(),
    overallScore: real("overall_score").notNull(),
    result: text("result").notNull(),
    summary: text("summary").notNull().default(""),
    actionPlan: text("action_plan").notNull().default(""),
    observedAt: text("observed_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_teacher_reviews_teacher_date").on(
      table.teacherId,
      table.observedAt
    ),
    index("idx_teacher_reviews_result").on(table.result),
  ]
);

export const teacherReviewItems = sqliteTable(
  "teacher_review_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reviewId: integer("review_id")
      .notNull()
      .references(() => teacherReviews.id, { onDelete: "cascade" }),
    criterionId: integer("criterion_id")
      .notNull()
      .references(() => criteria.id, { onDelete: "restrict" }),
    score: integer("score").notNull(),
    note: text("note").notNull().default(""),
  },
  (table) => [index("idx_teacher_items_review_id").on(table.reviewId)]
);

export const curriculumOverrides = sqliteTable(
  "curriculum_overrides",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    programCode: text("program_code").notNull(),
    unitNumber: integer("unit_number").notNull(),
    topic: text("topic").notNull().default(""),
    content: text("content").notNull().default(""),
    vocabulary: text("vocabulary").notNull().default(""),
    grammar: text("grammar").notNull().default(""),
    vocabularyMax: integer("vocabulary_max").notNull().default(0),
    writingRef: text("writing_ref").notNull().default(""),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_curriculum_overrides_program_unit").on(
      table.programCode,
      table.unitNumber
    ),
  ]
);

export const levelOptions = sqliteTable(
  "level_options",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    label: text("label").notNull(),
    programCode: text("program_code").notNull().default(""),
    active: integer("active").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_level_options_label_unique").on(table.label),
    index("idx_level_options_active_sort").on(table.active, table.sortOrder),
  ]
);

export const studentFeedbackOptions = sqliteTable(
  "student_feedback_options",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    category: text("category").notNull().default("Nhận xét chung"),
    label: text("label").notNull(),
    active: integer("active").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_student_feedback_options_label_unique").on(table.label),
    index("idx_student_feedback_options_active_sort").on(
      table.active,
      table.sortOrder
    ),
  ]
);

export const learningChecks = sqliteTable(
  "learning_checks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: integer("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    programCode: text("program_code").notNull(),
    programLabel: text("program_label").notNull(),
    unitNumber: integer("unit_number").notNull(),
    unitLabel: text("unit_label").notNull(),
    teacherName: text("teacher_name").notNull(),
    checkedAt: text("checked_at").notNull(),
    evaluationJson: text("evaluation_json").notNull(),
    overallScore: real("overall_score").notNull(),
    result: text("result").notNull(),
    feedbackJson: text("feedback_json").notNull().default("[]"),
    notes: text("notes").notNull().default(""),
    actionPlan: text("action_plan").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_learning_checks_student_date").on(
      table.studentId,
      table.checkedAt
    ),
    index("idx_learning_checks_program_date").on(
      table.programCode,
      table.checkedAt
    ),
    index("idx_learning_checks_result").on(table.result),
  ]
);

export const studentCheckQueue = sqliteTable(
  "student_check_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: integer("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    scheduledDate: text("scheduled_date").notNull(),
    status: text("status").notNull().default("pending"),
    createdBy: text("created_by").notNull().default(""),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_student_check_queue_student_date").on(
      table.studentId,
      table.scheduledDate
    ),
    index("idx_student_check_queue_date_status").on(
      table.scheduledDate,
      table.status
    ),
    index("idx_student_check_queue_class_date").on(
      table.classId,
      table.scheduledDate
    ),
  ]
);

export const authUsers = sqliteTable(
  "auth_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    pinHash: text("pin_hash").notNull(),
    pinSalt: text("pin_salt").notNull(),
    role: text("role").notNull(),
    active: integer("active").notNull().default(1),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_auth_users_email_unique").on(table.email),
    index("idx_auth_users_role_active").on(table.role, table.active),
  ]
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_auth_sessions_user_id").on(table.userId),
    index("idx_auth_sessions_expires_at").on(table.expiresAt),
  ]
);

export const authLoginAttempts = sqliteTable(
  "auth_login_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    ipAddress: text("ip_address").notNull(),
    attemptedAt: text("attempted_at").notNull(),
  },
  (table) => [
    index("idx_auth_login_attempts_lookup").on(
      table.email,
      table.ipAddress,
      table.attemptedAt
    ),
  ]
);
