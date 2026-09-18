"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ClipboardCheck, LoaderCircle, Pencil, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, build48Weeks, mondayOf, validDate, vietnamToday } from "@/lib/weekly-history";
import type { LearningCheck } from "@/lib/curriculum";

type Student = { id: number; name: string; classId: number | null; level: string };
type Legacy = { id: number; checkedAt: string; createdAt?: string; result: string; summary: string; actionPlan: string; evaluatorName: string; className: string | null };
type History = { studentId: number; startDate: string; savedStartDate: string | null; learningChecks: LearningCheck[]; legacy: Legacy[] };
type WeeklyRecord = { id: number; checkedAt: string; createdAt?: string; result: string; check?: LearningCheck; legacy?: Legacy };
const dateLabel = (value: string) => value.split("-").reverse().join("/");
const selectStyle = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
const resultStyle = (result: string) => result === "Good" || result === "Tốt" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : result === "Average" || result === "Đạt" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-800";
const feedback = (json: string) => { try { const value = JSON.parse(json); return Array.isArray(value) ? value.filter((item) => typeof item === "string").join(" · ") : ""; } catch { return ""; } };

export function WeeklyTracking({ students, classes, revision, initialStudentId = "", onCheck, criteriaFor }: {
  students: Student[]; classes: { id: number; name: string }[]; revision: unknown; initialStudentId?: string;
  onCheck: (studentId: number, date: string, editingCheck?: LearningCheck) => void;
  criteriaFor: (check: LearningCheck) => { label: string; value: string }[];
}) {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState(initialStudentId);
  const [requestedStart, setRequestedStart] = useState("");
  const [dateDraft, setDateDraft] = useState("");
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const selectedStudent = students.find((student) => String(student.id) === studentId);
  const today = vietnamToday();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!studentId) return;
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ studentId });
        if (requestedStart) params.set("startDate", requestedStart);
        const response = await fetch(`/api/student-history?${params}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json() as History & { error?: string };
        if (!response.ok) throw new Error(result.error || "Không thể tải lịch sử.");
        if (!controller.signal.aborted) { setHistory(result); setDateDraft(result.startDate); }
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không thể tải lịch sử."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [studentId, requestedStart, revision, refresh]);

  const current = history?.studentId === Number(studentId) ? history : null;
  const records: WeeklyRecord[] = current ? [
    ...current.learningChecks.map((check) => ({ id: check.id, checkedAt: check.checkedAt, createdAt: check.createdAt, result: check.result, check })),
    ...current.legacy.map((legacy) => ({ id: legacy.id, checkedAt: legacy.checkedAt, createdAt: legacy.createdAt, result: legacy.result, legacy })),
  ] : [];
  const weeks = current ? build48Weeks(current.startDate, records, today) : [];
  const saveStart = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const response = await fetch("/api/student-history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: current.studentId, startDate: current.startDate }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Không thể lưu mốc.");
      setRefresh((value) => value + 1); toast.success("Đã lưu mốc 48 tuần cho học viên.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu."); }
    finally { setSaving(false); }
  };
  const chooseStudent = (value: string) => { setStudentId(value); setRequestedStart(""); setDateDraft(""); };

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#d95c25]">Student Journey</p><h1 className="mt-1 text-3xl font-bold">Theo dõi 48 tuần</h1><p className="mt-2 text-sm text-muted-foreground">Mỗi tuần một lần kiểm tra · Thứ Hai đến Chủ nhật. Kết quả được lưu theo ngày đánh giá và có thể xem lại lâu dài.</p></div>
    <div className="grid gap-4 rounded-2xl bg-white p-5 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">Lớp học<select className={selectStyle} value={classId} onChange={(event) => { setClassId(event.target.value); chooseStudent(""); }}><option value="">Tất cả lớp</option><option value="unassigned">Chưa xếp lớp</option>{classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Học viên<select className={selectStyle} value={studentId} onChange={(event) => chooseStudent(event.target.value)}><option value="">Chọn học viên</option>{students.filter((student) => !classId || (classId === "unassigned" ? student.classId === null : String(student.classId) === classId)).map((student) => <option value={student.id} key={student.id}>{student.name} · {student.level}</option>)}</select></label>
    </div>
    {!selectedStudent ? <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground"><CalendarDays className="mx-auto mb-3" />Chọn học viên để xem 48 tuần theo dõi.</div> : loading ? <p className="flex items-center gap-2 py-8"><LoaderCircle className="animate-spin" />Đang tải lịch sử của {selectedStudent.name}...</p> : error ? <div className="rounded-xl border border-rose-200 bg-white p-5"><p role="alert">{error}</p><Button className="mt-3" variant="outline" onClick={() => setRefresh((value) => value + 1)}><RefreshCw /> Thử lại</Button></div> : current && <>
      <div className="space-y-4 rounded-2xl bg-white p-5">
        <div><h2 className="text-xl font-bold">{selectedStudent.name}</h2><p className="mt-1 text-sm text-muted-foreground">{dateLabel(current.startDate)} – {dateLabel(addDays(current.startDate, 335))} · {selectedStudent.level}</p></div>
        <div className="flex flex-wrap items-end gap-3"><label className="space-y-2 text-sm font-medium">Ngày bắt đầu 48 tuần<Input type="date" value={dateDraft} onChange={(event) => setDateDraft(event.target.value)} /></label><Button variant="outline" disabled={!validDate(dateDraft)} onClick={() => { if (validDate(dateDraft)) setRequestedStart(mondayOf(dateDraft)); }}>Xem khoảng này</Button><Button disabled={saving || current.savedStartDate === current.startDate} onClick={() => void saveStart()}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu mốc cho học viên</Button></div>
        <p className="text-xs leading-5 text-muted-foreground">Ngày bắt đầu được đưa về thứ Hai. Mốc đã lưu: {current.savedStartDate ? dateLabel(current.savedStartDate) : "chưa thiết lập, đang dùng tuần có kết quả đầu tiên (hoặc tuần hiện tại)"}. Thay mốc không xóa kết quả cũ.</p>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setRequestedStart(addDays(current.startDate, -336))}>← 48 tuần trước</Button><Button size="sm" variant="outline" onClick={() => { setRequestedStart(""); setRefresh((value) => value + 1); }}>Về mốc đã lưu</Button><Button size="sm" variant="outline" onClick={() => setRequestedStart(addDays(current.startDate, 336))}>48 tuần tiếp →</Button></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{[
        { label: "Tuần đã kiểm tra", count: weeks.filter((week) => week.records.length).length, style: "bg-emerald-50 text-emerald-800" },
        { label: "Tuần đã qua chưa kiểm tra", count: weeks.filter((week) => week.state === "missed").length, style: "bg-rose-50 text-rose-800" },
        { label: "Tuần chưa đến", count: weeks.filter((week) => week.state === "future").length, style: "bg-slate-100 text-slate-700" },
      ].map((item) => <div key={item.label} className={`rounded-xl p-5 ${item.style}`}><p className="text-sm">{item.label}</p><p className="mt-1 text-3xl font-bold">{item.count}</p></div>)}</div>
      <div className="space-y-3">{weeks.map((week) => <details key={week.startDate} className={`rounded-xl border bg-white p-4 ${week.state === "missed" ? "border-rose-200" : "border-slate-200"}`}>
        <summary className="cursor-pointer"><span className="ml-1 inline-flex w-[calc(100%-1.5rem)] flex-wrap items-center justify-between gap-2 align-middle"><span><strong>Tuần {week.number}</strong><span className="ml-3 text-sm text-muted-foreground">{dateLabel(week.startDate)} – {dateLabel(week.endDate)}</span></span><span className="flex items-center gap-2">{week.records.length > 1 && <span className="text-xs text-muted-foreground">{week.records.length} lần kiểm tra</span>}<Badge variant="outline" className={week.records[0] ? resultStyle(week.records[0].result) : ""}>{week.records[0]?.result || (week.state === "future" ? "Chưa đến tuần" : week.state === "current" ? "Tuần này · Chưa kiểm tra" : "Chưa kiểm tra")}</Badge></span></span></summary>
        <div className="mt-4 space-y-4">{week.records.length ? week.records.map((record) => <div key={`${record.check ? "check" : "legacy"}-${record.id}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{dateLabel(record.checkedAt)} · {record.check ? `${record.check.programLabel} · ${record.check.unitLabel}` : "Đánh giá đã lưu trước đây"}</p><p className="mt-1 text-xs text-muted-foreground">{record.check?.className || record.legacy?.className || "Chưa xếp lớp"} · Người kiểm tra: {record.check?.teacherName || record.legacy?.evaluatorName || "—"}</p></div><Badge variant="outline" className={resultStyle(record.result)}>{record.result}</Badge></div>
          {record.check && <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{criteriaFor(record.check).map((item) => <div key={item.label} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>}
          <p className="whitespace-pre-wrap break-words text-sm">{record.check ? [feedback(record.check.feedbackJson), record.check.notes, record.check.actionPlan].filter(Boolean).join("\n") || "Chưa có nhận xét." : [record.legacy?.summary, record.legacy?.actionPlan].filter(Boolean).join("\n") || "Chưa có nhận xét."}</p>
          {record.check && <Button size="sm" variant="outline" onClick={() => onCheck(current.studentId, record.checkedAt, record.check)}><Pencil /> Cập nhật kết quả</Button>}
        </div>) : <p className="text-sm text-muted-foreground">{week.state === "future" ? "Kết quả sẽ xuất hiện tại đây khi kiểm tra trong tuần này." : "Tuần này chưa có kết quả được lưu."}</p>}
        {week.startDate <= today && <Button size="sm" variant="outline" onClick={() => onCheck(current.studentId, today <= week.endDate ? today : week.startDate)}><ClipboardCheck /> {week.records.length ? "Thêm lần kiểm tra" : "Kiểm tra học viên"}</Button>}
        </div>
      </details>)}</div>
      <p className="text-xs leading-5 text-muted-foreground">Nếu một tuần có nhiều lần kiểm tra, nhãn tuần dùng kết quả có ngày mới nhất; mở tuần để xem tất cả các lần. Các bản ghi cùng ngày ưu tiên lần được tạo sau.</p>
    </>}
  </div>;
}
