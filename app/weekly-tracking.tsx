"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ClipboardCheck, LoaderCircle, Pencil, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { build48Weeks, vietnamToday } from "@/lib/weekly-history";
import type { LearningCheck } from "@/lib/curriculum";

type Student = { id: number; name: string; classId: number | null; level: string };
type Legacy = { id: number; checkedAt: string; createdAt?: string; result: string; summary: string; actionPlan: string; evaluatorName: string; className: string | null };
type History = {
  studentId: number;
  startDate: string;
  endDate: string;
  currentWeekStart: string;
  deletedBefore: string;
  learningChecks: LearningCheck[];
  legacy: Legacy[];
};
type WeeklyRecord = { id: number; checkedAt: string; createdAt?: string; result: string; check?: LearningCheck; legacy?: Legacy };
type EvaluationCriterion = { label: string; value: string; category?: "Pattern" | "Free"; criterion?: string };
const dateLabel = (value: string) => value.split("-").reverse().join("/");
const selectStyle = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
const resultStyle = (result: string) => result === "Good" || result === "Tốt" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : result === "Average" || result === "Đạt" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-800";
const feedback = (json: string) => { try { const value = JSON.parse(json); return Array.isArray(value) ? value.filter((item) => typeof item === "string").join(" · ") : ""; } catch { return ""; } };
const weekAge = (weekStart: string, currentWeekStart: string) =>
  Math.round((Date.parse(`${currentWeekStart}T00:00:00Z`) - Date.parse(`${weekStart}T00:00:00Z`)) / (7 * 24 * 60 * 60 * 1000));

function HistoryCriteria({ criteria }: { criteria: EvaluationCriterion[] }) {
  if (!criteria.some((item) => item.category)) {
    return <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{criteria.map((item) => <div key={item.label} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>;
  }
  const rows = ["Pronunciation", "One / Many", "Am / Is / Are"];
  return <div className="overflow-hidden rounded-lg border bg-white"><div className="grid grid-cols-[minmax(110px,1.2fr)_1fr_1fr] bg-slate-50 text-xs font-bold"><span className="px-3 py-2 text-muted-foreground">Tiêu chí</span><span className="border-l px-3 py-2">Pattern</span><span className="border-l px-3 py-2">Free</span></div>{rows.map((row) => <div key={row} className="grid grid-cols-[minmax(110px,1.2fr)_1fr_1fr] border-t text-sm"><span className="px-3 py-2 text-muted-foreground">{row}</span>{(["Pattern", "Free"] as const).map((category) => <strong key={category} className="border-l px-3 py-2">{criteria.find((item) => item.category === category && item.criterion === row)?.value || "—"}</strong>)}</div>)}</div>;
}

export function WeeklyTracking({ students, classes, revision, initialStudentId = "", onCheck, criteriaFor }: {
  students: Student[]; classes: { id: number; name: string }[]; revision: unknown; initialStudentId?: string;
  onCheck: (studentId: number, date: string, editingCheck?: LearningCheck) => void;
  criteriaFor: (check: LearningCheck) => EvaluationCriterion[];
}) {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState(initialStudentId);
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const selectedStudent = students.find((student) => String(student.id) === studentId);
  const today = vietnamToday();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!studentId) { setHistory(null); return; }
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/student-history?studentId=${encodeURIComponent(studentId)}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json() as History & { error?: string };
        if (!response.ok) throw new Error(result.error || "Không thể tải lịch sử.");
        if (!controller.signal.aborted) setHistory(result);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không thể tải lịch sử.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [studentId, revision, refresh]);

  const current = history?.studentId === Number(studentId) ? history : null;
  const records: WeeklyRecord[] = current ? [
    ...current.learningChecks.map((check) => ({ id: check.id, checkedAt: check.checkedAt, createdAt: check.createdAt, result: check.result, check })),
    ...current.legacy.map((legacy) => ({ id: legacy.id, checkedAt: legacy.checkedAt, createdAt: legacy.createdAt, result: legacy.result, legacy })),
  ] : [];
  const weeks = current ? build48Weeks(current.startDate, records, today) : [];
  const chooseStudent = (value: string) => setStudentId(value);

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#2f6f9f]">Student Journey</p><h1 className="mt-1 text-3xl font-bold">Theo dõi 48 tuần</h1><p className="mt-2 text-sm text-muted-foreground">Luôn hiển thị tuần hiện tại và 47 tuần trước đó, tính từ thứ Hai đến Chủ nhật. Khi sang tuần mới, tuần thứ 49 trong quá khứ được tự động xóa.</p></div>
    <div className="grid gap-4 rounded-2xl bg-white p-5 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">Lớp học<select className={selectStyle} value={classId} onChange={(event) => { setClassId(event.target.value); chooseStudent(""); }}><option value="">Tất cả lớp</option><option value="unassigned">Chưa xếp lớp</option>{classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Học viên<select className={selectStyle} value={studentId} onChange={(event) => chooseStudent(event.target.value)}><option value="">Chọn học viên</option>{students.filter((student) => !classId || (classId === "unassigned" ? student.classId === null : String(student.classId) === classId)).map((student) => <option value={student.id} key={student.id}>{student.name} · {student.level}</option>)}</select></label>
    </div>
    {!selectedStudent ? <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground"><CalendarDays className="mx-auto mb-3" />Chọn học viên để xem 48 tuần gần nhất.</div> : loading ? <p className="flex items-center gap-2 py-8"><LoaderCircle className="animate-spin" />Đang tải lịch sử của {selectedStudent.name}...</p> : error ? <div className="rounded-xl border border-rose-200 bg-white p-5"><p role="alert">{error}</p><Button className="mt-3" variant="outline" onClick={() => setRefresh((value) => value + 1)}><RefreshCw /> Thử lại</Button></div> : current && <>
      <div className="space-y-3 rounded-2xl bg-white p-5">
        <div><h2 className="text-xl font-bold">{selectedStudent.name}</h2><p className="mt-1 text-sm text-muted-foreground">{dateLabel(current.startDate)} – {dateLabel(current.endDate)} · {selectedStudent.level}</p></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>Lưu trữ cuốn chiếu:</strong> hệ thống giữ đúng 48 tuần gần nhất. Kết quả trước ngày {dateLabel(current.deletedBefore)} đã được xóa; hãy sao lưu D1 trước khi cần giữ dữ liệu lâu hơn.</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{[
        { label: "Tuần đã kiểm tra", count: weeks.filter((week) => week.records.length).length, style: "bg-emerald-50 text-emerald-800" },
        { label: "Tuần đã qua chưa kiểm tra", count: weeks.filter((week) => week.state === "missed").length, style: "bg-rose-50 text-rose-800" },
        { label: "Tổng lượt còn lưu", count: records.length, style: "bg-slate-100 text-slate-700" },
      ].map((item) => <div key={item.label} className={`rounded-xl p-5 ${item.style}`}><p className="text-sm">{item.label}</p><p className="mt-1 text-3xl font-bold">{item.count}</p></div>)}</div>
      <div className="space-y-3">{[...weeks].reverse().map((week) => {
        const age = weekAge(week.startDate, current.currentWeekStart);
        const title = age === 0 ? "Tuần hiện tại" : `${age} tuần trước`;
        return <details key={week.startDate} className={`rounded-xl border bg-white p-4 ${week.state === "missed" ? "border-rose-200" : "border-slate-200"}`}>
          <summary className="cursor-pointer"><span className="ml-1 inline-flex w-[calc(100%-1.5rem)] flex-wrap items-center justify-between gap-2 align-middle"><span><strong>{title}</strong><span className="ml-3 text-sm text-muted-foreground">{dateLabel(week.startDate)} – {dateLabel(week.endDate)}</span></span><span className="flex items-center gap-2">{week.records.length > 1 && <span className="text-xs text-muted-foreground">{week.records.length} lần kiểm tra</span>}<Badge variant="outline" className={week.records[0] ? resultStyle(week.records[0].result) : ""}>{week.records[0]?.result || (week.state === "current" ? "Tuần này · Chưa kiểm tra" : "Chưa kiểm tra")}</Badge></span></span></summary>
          <div className="mt-4 space-y-4">{week.records.length ? week.records.map((record) => <div key={`${record.check ? "check" : "legacy"}-${record.id}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{dateLabel(record.checkedAt)} · {record.check ? `${record.check.programLabel} · ${record.check.unitLabel}` : "Đánh giá đã lưu trước đây"}</p><p className="mt-1 text-xs text-muted-foreground">{record.check?.className || record.legacy?.className || "Chưa xếp lớp"} · Người kiểm tra: {record.check?.teacherName || record.legacy?.evaluatorName || "—"}</p></div><Badge variant="outline" className={resultStyle(record.result)}>{record.result}</Badge></div>
            {record.check && <HistoryCriteria criteria={criteriaFor(record.check)} />}
            <p className="whitespace-pre-wrap break-words text-sm">{record.check ? [feedback(record.check.feedbackJson), record.check.notes, record.check.actionPlan].filter(Boolean).join("\n") || "Chưa có nhận xét." : [record.legacy?.summary, record.legacy?.actionPlan].filter(Boolean).join("\n") || "Chưa có nhận xét."}</p>
            {record.check && <Button size="sm" variant="outline" onClick={() => onCheck(current.studentId, record.checkedAt, record.check)}><Pencil /> Cập nhật kết quả</Button>}
          </div>) : <p className="text-sm text-muted-foreground">{week.state === "current" ? "Tuần này chưa có kết quả được lưu." : "Tuần này chưa có kết quả."}</p>}
          <Button size="sm" variant="outline" onClick={() => onCheck(current.studentId, week.state === "current" ? today : week.startDate)}><ClipboardCheck /> {week.records.length ? "Thêm lần kiểm tra" : "Kiểm tra học viên"}</Button>
          </div>
        </details>;
      })}</div>
      <p className="text-xs leading-5 text-muted-foreground">Nếu một tuần có nhiều lần kiểm tra, nhãn tuần dùng kết quả có ngày mới nhất; mở tuần để xem tất cả. Dữ liệu ngoài cửa sổ 48 tuần bị xóa vĩnh viễn khỏi D1 khi hệ thống được sử dụng sau khi sang tuần mới.</p>
    </>}
  </div>;
}
