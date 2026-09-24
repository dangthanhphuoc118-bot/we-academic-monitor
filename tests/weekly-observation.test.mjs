import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { build } from "esbuild";
import { drizzle } from "drizzle-orm/d1";
import { addDays, build48Weeks, mondayOf, validDate, vietnamToday } from "../lib/weekly-history.ts";
import { studentHistoryWindow } from "../lib/history-retention.ts";
import { emptyObservation, observationGroups, validateObservationItems } from "../lib/observation.ts";

test("48 weeks use Vietnam dates, Monday boundaries, leap days and retain multiple checks", () => {
  assert.equal(vietnamToday(new Date("2026-09-17T18:00:00Z")), "2026-09-18");
  assert.equal(mondayOf("2027-01-03"), "2026-12-28");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2026-9-18"), false);
  const weeks = build48Weeks("2026-09-18", [
    { id: 1, checkedAt: "2026-09-14" }, { id: 2, checkedAt: "2026-09-20" },
    { id: 3, checkedAt: "2026-09-20" }, { id: 4, checkedAt: "2026-09-21" },
    { id: 5, checkedAt: "2026-09-13" }, { id: 6, checkedAt: "2027-08-16" },
  ], "2026-10-05");
  assert.equal(weeks.length, 48);
  assert.deepEqual(weeks[0].records.map((row) => row.id), [3, 2, 1]);
  assert.equal(weeks[1].records[0].id, 4);
  assert.equal(weeks[2].state, "missed");
  assert.equal(weeks[3].state, "current");
  assert.equal(weeks[4].state, "future");
  assert.equal(weeks[47].endDate, "2027-08-15");
  const sameDay = build48Weeks("2026-09-14", [{ id: 100, checkedAt: "2026-09-18", createdAt: "2026-09-18 10:00:00" }, { id: 1, checkedAt: "2026-09-18", createdAt: "2026-09-18 11:00:00" }]);
  assert.equal(sameDay[0].records[0].id, 1);
});

test("Observation follows seven PDF checkbox/note criteria without scores", () => {
  assert.deepEqual(observationGroups.map((group) => group.criteria.length), [4, 3]);
  const items = emptyObservation();
  assert.throws(() => validateObservationItems(items));
  items.phoneUse.note = "  Không dùng điện thoại trong giờ  ";
  assert.equal(validateObservationItems(items).phoneUse.note, "Không dùng điện thoại trong giờ");
  assert.equal(validateObservationItems(items).phoneUse.checked, false);
  assert.throws(() => validateObservationItems({ ...items, phoneUse: { checked: "false", note: "" } }));
  assert.throws(() => validateObservationItems({ ...items, phoneUse: { checked: true, note: "x".repeat(4001) } }));
});

// Execute production handlers and real session checks against an isolated SQLite-backed D1 adapter.
// Nothing in this suite contacts Cloudflare or changes a real database.
const sqlite = new DatabaseSync(":memory:");
sqlite.exec("PRAGMA foreign_keys = ON");
const migrationDir = new URL("../drizzle/", import.meta.url);
const migrations = readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort();
const additiveMigrations = migrations.filter((name) => Number(name.slice(0, 4)) >= 5);
for (const migration of migrations.filter((name) => !additiveMigrations.includes(name))) sqlite.exec(readFileSync(new URL(migration, migrationDir), "utf8"));
sqlite.exec(`
  INSERT INTO teachers(id,name) VALUES (1,'Teacher One');
  INSERT INTO classes(id,name,level,teacher_id) VALUES (1,'CLASS A','FLYERS',1);
  INSERT INTO students(id,name,level,class_id) VALUES (1,'Student One','Flyers',1),(2,'Student Two','Movers',1);
  INSERT INTO teacher_reviews(teacher_id,reviewer_name,overall_score,result,observed_at) VALUES(1,'Old AL',3,'Đạt','2026-09-01');
  INSERT INTO curriculum_overrides(program_code,unit_number,vocabulary) VALUES('FLYERS',1,'My custom vocabulary');
`);
for (const [index, role] of ["admin", "academic_manager", "academic_leader"].entries()) {
  sqlite.prepare("INSERT INTO auth_users(id,name,email,pin_hash,pin_salt,role) VALUES(?,?,?,?,?,?)").run(index + 1, `Test ${role}`, `${role}@example.test`, "unused", "unused", role);
  sqlite.prepare("INSERT INTO auth_sessions(id,user_id,expires_at) VALUES(?,?,?)").run(role, index + 1, "2099-01-01T00:00:00.000Z");
}
const preservationQueries = [
  ["students", "SELECT * FROM students"],
  ["teachers", "SELECT * FROM teachers"],
  ["teacher_reviews", "SELECT * FROM teacher_reviews"],
  ["auth_users", "SELECT * FROM auth_users"],
  ["auth_sessions", "SELECT * FROM auth_sessions"],
  ["curriculum_overrides", "SELECT program_code, unit_number, vocabulary FROM curriculum_overrides"],
];
const beforeMigration = preservationQueries.map(([table, query]) => [table, query, JSON.stringify(sqlite.prepare(query).all())]);
for (const migration of additiveMigrations) {
  if (migration.startsWith("0008_")) sqlite.exec("UPDATE curriculum_overrides SET freestyle_questions='[\"Old D1 question?\"]' WHERE program_code='FLYERS' AND unit_number=1");
  sqlite.exec(readFileSync(new URL(migration, migrationDir), "utf8"));
}
const adapter = {
  prepare(sql) {
    let values = [];
    return {
      bind(...params) { values = params; return this; },
      async raw() { const statement = sqlite.prepare(sql); statement.setReturnArrays(true); return statement.all(...values); },
      async all() { return { success: true, results: sqlite.prepare(sql).all(...values) }; },
      async run() { const result = sqlite.prepare(sql).run(...values); return { success: true, results: [], meta: { changes: result.changes, last_row_id: Number(result.lastInsertRowid) } }; },
    };
  },
};
globalThis.__academicTestDb = drizzle(adapter);
async function loadRoute(file) {
  const result = await build({
    entryPoints: [new URL(`../${file}`, import.meta.url).pathname], bundle: true, write: false, platform: "node", format: "esm",
    plugins: [{ name: "local-database-only", setup(build) {
      build.onResolve({ filter: /^@\/db$/ }, () => ({ path: "test-db", namespace: "fixture" }));
      build.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: "test-env", namespace: "fixture" }));
      build.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({ contents: args.path === "test-db" ? "export const getDb = () => globalThis.__academicTestDb;" : "export const env = {};" }));
    } }],
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
const observations = await loadRoute("app/api/observations/route.ts");
const history = await loadRoute("app/api/student-history/route.ts");
const academic = await loadRoute("app/api/academic/route.ts");
const req = (path, role = "academic_leader", body) => new Request(`https://test.local${path}`, { method: body ? "POST" : "GET", headers: { ...(role ? { Cookie: `we_academic_session=${role}` } : {}), "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });

test("Additive migrations preserve existing learners, reviews, auth and curriculum overrides", () => {
  for (const [table, query, snapshot] of beforeMigration) assert.equal(JSON.stringify(sqlite.prepare(query).all()), snapshot, table);
  assert.equal(JSON.stringify(sqlite.prepare("SELECT class_id AS classId, teacher_id AS teacherId FROM class_teachers").all()), JSON.stringify([{ classId: 1, teacherId: 1 }]));
  assert.equal(sqlite.prepare("SELECT freestyle_questions AS questions FROM curriculum_overrides WHERE program_code='FLYERS' AND unit_number=1").get().questions, "[]");
});

test("Both endpoints reject missing or expired sessions", async () => {
  for (const role of [null, "unknown-session"]) {
    assert.equal((await observations.GET(req("/api/observations", role))).status, 401);
    assert.equal((await observations.POST(req("/api/observations", role, { action: "create" }))).status, 401);
    assert.equal((await history.GET(req("/api/student-history?studentId=1", role))).status, 401);
    assert.equal((await history.POST(req("/api/student-history", role, { studentId: 1, startDate: "2026-09-14" }))).status, 401);
  }
});

test("All three roles can create/edit observations; notes and observer survive updates", async () => {
  for (const role of ["admin", "academic_manager", "academic_leader"]) {
    const items = emptyObservation(); items.englishUse = { checked: true, note: "Uses clear instructions" };
    const body = { action: "create", teacherId: 1, teacherRole: "ta", classId: 1, observedAt: "2026-09-18", observedTime: "18:30", items, observerName: "Spoofed" };
    const response = await observations.POST(req("/api/observations", role, body));
    assert.equal(response.status, 200, await response.clone().text());
    const { observation } = await response.json();
    assert.equal(observation.observerName, `Test ${role}`);
    items.leavingClass.note = "Stayed throughout the lesson";
    const updated = await observations.POST(req("/api/observations", "admin", { ...body, action: "update", id: observation.id, items }));
    assert.equal(updated.status, 200);
    const { observation: saved } = await updated.json();
    assert.equal(saved.id, observation.id);
    assert.equal(saved.observerName, `Test ${role}`);
    assert.equal(JSON.parse(saved.itemsJson).leavingClass.note, "Stayed throughout the lesson");
    assert.equal(Object.hasOwn(saved, "overallScore"), false);
  }
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM teacher_observations").get().n, 3);
  const invalid = { action: "create", teacherId: 1, teacherRole: "teacher", classId: 1, observedAt: "2026-02-30", observedTime: "25:10", items: emptyObservation() };
  assert.equal((await observations.POST(req("/api/observations", "admin", invalid))).status, 400);
  assert.equal((await observations.POST(req("/api/observations", "admin", { action: "update", id: 9999 }))).status, 404);
});

test("Rolling history keeps 48 weeks, loads more than 300 records and prunes week 49", async () => {
  assert.deepEqual(studentHistoryWindow("2026-09-18"), { startDate: "2025-10-20", endDate: "2026-09-20", endExclusive: "2026-09-21", currentWeekStart: "2026-09-14" });
  const window = studentHistoryWindow(vietnamToday());
  const insert = sqlite.prepare("INSERT INTO learning_checks(student_id,class_id,program_code,program_label,unit_number,unit_label,teacher_name,checked_at,evaluation_json,overall_score,result) VALUES(?,1,'FLYERS','Flyers',1,'Unit 1','AL',?,'{}',3,'Average')");
  for (let i = 0; i < 310; i++) insert.run(1, addDays(window.startDate, i));
  insert.run(1, addDays(window.startDate, -1)); insert.run(1, window.endExclusive); insert.run(2, vietnamToday());
  sqlite.exec("INSERT INTO student_assessments(student_id,class_id,evaluator_name,overall_score,result,checked_at,summary) VALUES(1,1,'Old AL',3,'Đạt','2026-09-18','Older notes')");
  sqlite.prepare("INSERT INTO student_assessments(student_id,class_id,evaluator_name,overall_score,result,checked_at,summary) VALUES(1,1,'Old AL',3,'Đạt',?,'Expired notes')").run(addDays(window.startDate, -1));
  sqlite.prepare("INSERT INTO student_check_queue(student_id,class_id,scheduled_date,status,created_by) VALUES(1,1,?,'completed','AL'),(2,1,?,'pending','AL')").run(addDays(window.startDate, -1), addDays(window.startDate, -1));
  for (const role of ["admin", "academic_manager", "academic_leader"]) {
    const saved = await history.POST(req("/api/student-history", role, { studentId: 1, startDate: "2026-09-18" }));
    assert.equal(saved.status, 405);
  }
  const response = await history.GET(req("/api/student-history?studentId=1"));
  assert.equal(response.status, 200, await response.clone().text());
  const rows = await response.json();
  assert.equal(rows.startDate, window.startDate);
  assert.equal(rows.endDate, window.endDate);
  assert.equal(rows.currentWeekStart, window.currentWeekStart);
  assert.equal(rows.deletedBefore, window.startDate);
  assert.equal(Object.hasOwn(rows, "savedStartDate"), false);
  assert.equal(rows.learningChecks.length, 310);
  assert.equal(rows.legacy.length, 1);
  assert.equal(rows.legacy[0].summary, "Older notes");
  assert.ok(rows.learningChecks.every((row) => row.studentId === 1 && row.studentName === "Student One"));
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM learning_checks WHERE checked_at < ?").get(window.startDate).n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM student_assessments WHERE checked_at < ?").get(window.startDate).n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM student_check_queue WHERE status='completed' AND scheduled_date < ?").get(window.startDate).n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM student_check_queue WHERE status='pending' AND scheduled_date < ?").get(window.startDate).n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM learning_checks WHERE checked_at=?").get(window.endExclusive).n, 1);
  assert.equal((await history.GET(req("/api/student-history?studentId=9999"))).status, 404);
});

test("Academic payload includes observations and does not overwrite custom curriculum", async () => {
  const response = await academic.GET(req("/api/academic"));
  assert.equal(response.status, 200, await response.clone().text());
  const data = await response.json();
  assert.equal(data.teacherObservations.length, 3);
  assert.equal(data.teacherReviews.length, 1);
  const unit = data.curriculum.find((unit) => unit.programCode === "FLYERS" && unit.unitNumber === 1);
  assert.equal(unit.vocabulary, "My custom vocabulary");
  assert.equal(Object.hasOwn(unit, "freestyleQuestions"), false);
  assert.match(data.curriculum.find((unit) => unit.programCode === "FLYERS" && unit.unitNumber === 2).vocabulary, /PREPOSITION:/);
  const startersBank = data.freestyleBanks.find((bank) => bank.programCode === "STARTERS");
  assert.deepEqual(startersBank.categories.map((category) => category.category), ["Personal information", "Family and Friends", "Your house", "Sports", "Food", "Animals", "Schools"]);
  assert.equal(startersBank.categories.flatMap((category) => [...category.yesNoQuestions, ...category.whQuestions]).length, 46);
  assert.deepEqual(data.freestyleBanks.find((bank) => bank.programCode === "MOVERS").categories, []);
  assert.deepEqual(data.freestyleBanks.find((bank) => bank.programCode === "FLYERS").categories, []);

  const blockedQuestions = ["Mover A?", "Mover B?", "Mover C?", "Mover D?", "Mover E?"];
  const blocked = await academic.POST(req("/api/academic", "academic_leader", { action: "createLearningCheck", studentId: 2, programCode: "MOVERS", unitNumber: 1, checkedAt: "2026-09-18", notes: "", feedback: [], evaluation: { patternPercent: 90, freestylePercent: 90, pronunciation: "clear", pattern: { oneOrMany: "correct", amIsAre: "correct" }, free: { oneOrMany: "correct", amIsAre: "correct" }, freestyleCategory: "General", freestyleQuestions: blockedQuestions } }));
  assert.equal(blocked.status, 400);
  assert.match((await blocked.json()).error, /ít nhất 5 câu/);

  const customQuestions = ["Flyers question A?", "Flyers question B?", "Flyers question C?", "Flyers question D?", "Flyers question E?"];
  const bankSaved = await academic.POST(req("/api/academic", "academic_manager", { action: "updateFreestyleBank", programCode: "FLYERS", categories: [{ category: "General", yesNoQuestions: customQuestions.slice(0, 2), whQuestions: customQuestions.slice(2) }] }));
  assert.equal(bankSaved.status, 200, await bankSaved.clone().text());
  const saved = await academic.POST(req("/api/academic", "academic_manager", { action: "updateCurriculumUnit", ...unit }));
  assert.equal(saved.status, 200, await saved.clone().text());
  const refreshed = await (await academic.GET(req("/api/academic"))).json();
  assert.deepEqual(refreshed.freestyleBanks.find((bank) => bank.programCode === "FLYERS").categories[0].whQuestions, customQuestions.slice(2));
  assert.equal(Object.hasOwn(refreshed.curriculum.find((row) => row.programCode === "FLYERS" && row.unitNumber === 1), "freestyleQuestions"), false);
});

test("A class can assign multiple teachers and keeps the previous teacher after migration", async () => {
  let data = await (await academic.GET(req("/api/academic"))).json();
  let classroom = data.classes.find((row) => row.id === 1);
  assert.deepEqual(classroom.teacherIds, [1]);
  assert.deepEqual(classroom.teacherNames, ["Teacher One"]);

  const created = await academic.POST(req("/api/academic", "academic_manager", { action: "createTeacher", name: "Teacher Two", status: "active" }));
  assert.equal(created.status, 201, await created.clone().text());
  const teacherTwo = (await created.json()).item;

  const updated = await academic.POST(req("/api/academic", "academic_leader", { action: "updateClass", id: 1, name: "CLASS A", schedule: "Thứ 2, 4", room: "P.1", status: "active", teacherIds: [1, teacherTwo.id, teacherTwo.id] }));
  assert.equal(updated.status, 200, await updated.clone().text());
  assert.deepEqual((await updated.json()).item.teacherIds, [1, teacherTwo.id]);

  data = await (await academic.GET(req("/api/academic"))).json();
  classroom = data.classes.find((row) => row.id === 1);
  assert.deepEqual(classroom.teacherIds, [1, teacherTwo.id]);
  assert.deepEqual(classroom.teacherNames, ["Teacher One", "Teacher Two"]);
  assert.equal(data.teachers.find((row) => row.id === 1).classCount, 1);
  assert.equal(data.teachers.find((row) => row.id === teacherTwo.id).classCount, 1);
  assert.equal((await academic.POST(req("/api/academic", "admin", { action: "deleteTeacher", id: teacherTwo.id }))).status, 409);
  assert.equal((await academic.POST(req("/api/academic", "admin", { action: "updateClass", id: 1, name: "CLASS A", teacherIds: [9999] }))).status, 400);

  const reassigned = await academic.POST(req("/api/academic", "academic_manager", { action: "updateClass", id: 1, name: "CLASS A", schedule: "Thứ 2, 4", room: "P.1", status: "active", teacherIds: [teacherTwo.id] }));
  assert.equal(reassigned.status, 200, await reassigned.clone().text());
  assert.equal(sqlite.prepare("SELECT teacher_id AS teacherId FROM classes WHERE id=1").get().teacherId, teacherTwo.id);
  assert.equal(JSON.stringify(sqlite.prepare("SELECT teacher_id AS teacherId FROM class_teachers WHERE class_id=1").all()), JSON.stringify([{ teacherId: teacherTwo.id }]));
});

test("Saving and editing a student check updates its rolling history without duplicate records", async () => {
  const questions = ["Flyers question A?", "Flyers question B?", "Flyers question C?", "Flyers question D?", "Flyers question E?"];
  const body = { action: "createLearningCheck", studentId: 1, programCode: "FLYERS", unitNumber: 2, checkedAt: "2026-09-18", notes: "Weekly feedback", feedback: [], evaluation: { patternPercent: 90, freestylePercent: 80, pronunciation: "clear", pattern: { oneOrMany: "correct", amIsAre: "correct" }, free: { oneOrMany: "correct", amIsAre: "incorrect" }, freestyleCategory: "General", freestyleQuestions: questions } };
  const created = await academic.POST(req("/api/academic", "academic_leader", body));
  assert.equal(created.status, 201, await created.clone().text());
  const { item } = await created.json();
  assert.equal(item.result, "Good");
  const savedEvaluation = JSON.parse(sqlite.prepare("SELECT evaluation_json AS evaluationJson FROM learning_checks WHERE id=?").get(item.id).evaluationJson);
  assert.deepEqual(savedEvaluation.pattern, body.evaluation.pattern);
  assert.deepEqual(savedEvaluation.free, body.evaluation.free);
  assert.equal(savedEvaluation.pronunciation, "clear");
  assert.equal(savedEvaluation.freestyleCategory, "General");
  assert.equal(savedEvaluation.patternPercent, 90);
  assert.equal(savedEvaluation.freestylePercent, 80);
  const countBefore = sqlite.prepare("SELECT count(*) AS n FROM learning_checks").get().n;
  const updated = await academic.POST(req("/api/academic", "academic_manager", { ...body, action: "updateLearningCheck", id: item.id, checkedAt: "2026-09-13", notes: "Updated feedback" }));
  assert.equal(updated.status, 200, await updated.clone().text());
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM learning_checks").get().n, countBefore);
  const result = await (await history.GET(req("/api/student-history?studentId=1"))).json();
  const check = result.learningChecks.find((row) => row.id === item.id);
  assert.equal(check.notes, "Updated feedback");
  assert.equal(check.teacherName, "Test academic_leader");
  assert.equal(build48Weeks(result.startDate, [check]).find((week) => week.records.some((record) => record.id === item.id)).records[0].id, item.id);
  assert.equal((await academic.POST(req("/api/academic", "academic_leader", { ...body, checkedAt: "2026-02-30" }))).status, 400);
  assert.equal((await academic.POST(req("/api/academic", "academic_leader", { ...body, checkedAt: "2025-10-19" }))).status, 400);
  assert.equal((await academic.POST(req("/api/academic", "academic_leader", { ...body, evaluation: { ...body.evaluation, freestyleQuestions: ["Only one?"] } }))).status, 400);
});

test("Observation snapshot remains readable and editable when teacher/class are removed", async () => {
  sqlite.exec("DELETE FROM teachers WHERE id=1; DELETE FROM classes WHERE id=1;");
  const response = await observations.GET(req("/api/observations"));
  const row = (await response.json()).observations[0];
  assert.equal(row.teacherId, null); assert.equal(row.classId, null);
  assert.equal(row.teacherName, "Teacher One"); assert.equal(row.className, "CLASS A");
  const saved = await observations.POST(req("/api/observations", "academic_leader", { ...row, action: "update", items: JSON.parse(row.itemsJson) }));
  assert.equal(saved.status, 200, await saved.clone().text());
  assert.equal((await observations.POST(req("/api/observations", "admin", { action: "delete", id: row.id }))).status, 200);
  assert.equal((await observations.POST(req("/api/observations", "admin", { action: "delete", id: row.id }))).status, 404);
});
