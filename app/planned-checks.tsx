"use client";

import { useState } from "react";
import { CalendarDays, ClipboardCheck, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { programs, type CurriculumUnit, type StudentCheckQueueItem } from "@/lib/curriculum";
import { vietnamToday } from "@/lib/weekly-history";
import type { LevelOption } from "./curriculum-check";

type Student = { id: number; name: string; classId: number | null; level: string };
type Class = { id: number; name: string };

export function queueUnitNumbers(item: StudentCheckQueueItem): number[] {
  try {
    const values: unknown = JSON.parse(item.unitNumbersJson || "[]");
    return Array.isArray(values) ? values.filter((value): value is number => Number.isInteger(value) && value > 0) : [];
  } catch { return []; }
}

export function PlannedChecks({ students, classes, curriculum, levelOptions, items, onReload, onOpen }: {
  students: Student[]; classes: Class[]; curriculum: CurriculumUnit[]; levelOptions: LevelOption[];
  items: StudentCheckQueueItem[]; onReload: () => Promise<void>; onOpen: (item: StudentCheckQueueItem) => void;
}) {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(vietnamToday());
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const selectedStudent = students.find((item) => String(item.id) === studentId);
  const configuredCode = levelOptions.find((item) => item.label.toLowerCase() === selectedStudent?.level.toLowerCase())?.programCode;
  const programCode = configuredCode || programs.find((item) => item.label.toLowerCase() === selectedStudent?.level.toLowerCase())?.code;
  const availableUnits = curriculum.filter((unit) => unit.programCode === programCode);
  const pending = items.filter((item) => item.status === "pending");
  const completed = items.filter((item) => item.status === "completed" && queueUnitNumbers(item).length);

  const reset = () => { setEditingId(null); setStudentId(""); setSelectedUnits([]); setScheduledDate(vietnamToday()); };
  const edit = (item: StudentCheckQueueItem) => {
    setEditingId(item.id);
    setClassId(item.classId ? String(item.classId) : "");
    setStudentId(String(item.studentId));
    setScheduledDate(item.scheduledDate);
    const currentLevel = students.find((row) => row.id === item.studentId)?.level || "";
    const currentCode = levelOptions.find((row) => row.label.toLowerCase() === currentLevel.toLowerCase())?.programCode
      || programs.find((row) => row.label.toLowerCase() === currentLevel.toLowerCase())?.code;
    setSelectedUnits(item.programCode === currentCode ? queueUnitNumbers(item) : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = async () => {
    if (!selectedStudent || !selectedUnits.length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/academic", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsertPlannedCheck", studentId: selectedStudent.id, scheduledDate, unitNumbers: selectedUnits }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Không thể lưu lịch kiểm tra.");
      await onReload(); reset(); toast.success("Đã lưu danh sách kiểm tra dự kiến.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu lịch kiểm tra."); }
    finally { setBusy(false); }
  };
  const remove = async (item: StudentCheckQueueItem) => {
    if (!window.confirm(`Xóa lịch kiểm tra của ${item.studentName} ngày ${item.scheduledDate}?`)) return;
    try {
      const response = await fetch("/api/academic", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeStudentCheck", id: item.id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Không thể xóa lịch.");
      await onReload(); if (editingId === item.id) reset(); toast.success("Đã xóa lịch kiểm tra.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể xóa lịch."); }
  };
  const unitLabels = (item: StudentCheckQueueItem) => {
    const student = students.find((row) => row.id === item.studentId);
    const code = item.programCode || levelOptions.find((row) => row.label.toLowerCase() === student?.level.toLowerCase())?.programCode
      || programs.find((row) => row.label.toLowerCase() === student?.level.toLowerCase())?.code;
    const numbers = queueUnitNumbers(item);
    return numbers.length ? curriculum.filter((unit) => unit.programCode === code && numbers.includes(unit.unitNumber)).map((unit) => unit.unitLabel).join(", ") : "Chưa chọn Unit";
  };
  const currentProgram = (item: StudentCheckQueueItem) => {
    const level = students.find((row) => row.id === item.studentId)?.level || "";
    return levelOptions.find((row) => row.label.toLowerCase() === level.toLowerCase())?.programCode
      || programs.find((row) => row.label.toLowerCase() === level.toLowerCase())?.code;
  };

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#2f6f9f]">Academic Leader</p><h1 className="mt-1 text-3xl font-bold">Danh sách kiểm tra dự kiến</h1><p className="mt-2 text-sm text-muted-foreground">Chuẩn bị học viên và nhiều Unit trước giờ kiểm tra. Mỗi học viên có một lịch cho mỗi ngày; mỗi Unit được chấm trong một bảng riêng.</p></div>
    <Card><CardHeader><CardTitle>{editingId ? "Sửa lịch kiểm tra" : "Thêm học viên vào danh sách"}</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="planned-class">Lớp học</Label><select id="planned-class" className="mt-2 h-10 w-full rounded-lg border bg-white px-3 text-sm" value={classId} disabled={Boolean(editingId)} onChange={(event) => { setClassId(event.target.value); setStudentId(""); setSelectedUnits([]); }}><option value="">Tất cả lớp</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><Label htmlFor="planned-student">Học viên</Label><select id="planned-student" className="mt-2 h-10 w-full rounded-lg border bg-white px-3 text-sm" value={studentId} disabled={Boolean(editingId)} onChange={(event) => { setStudentId(event.target.value); setSelectedUnits([]); }}><option value="">Chọn học viên</option>{students.filter((item) => !classId || String(item.classId) === classId).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.level}</option>)}</select></div>
        <div><Label htmlFor="planned-date">Ngày dự kiến</Label><Input id="planned-date" className="mt-2" type="date" value={scheduledDate} disabled={Boolean(editingId)} onChange={(event) => setScheduledDate(event.target.value)} /></div>
      </div>
      {selectedStudent ? <div><p className="mb-2 text-sm font-semibold">Chọn Unit / Day cần kiểm tra · {selectedStudent.level}</p>{availableUnits.length ? <div className="grid max-h-60 gap-1 overflow-y-auto rounded-xl border p-2 sm:grid-cols-2 lg:grid-cols-3">{availableUnits.map((unit) => <label key={unit.unitNumber} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm hover:bg-slate-50"><Checkbox checked={selectedUnits.includes(unit.unitNumber)} onCheckedChange={(checked) => setSelectedUnits((current) => checked ? [...current, unit.unitNumber].sort((a, b) => a - b) : current.filter((number) => number !== unit.unitNumber))} /><span><strong>{unit.unitLabel}</strong> · {unit.topic}</span></label>)}</div> : <p className="text-sm text-amber-800">Chưa xác định chương trình phù hợp với trình độ học viên.</p>}</div> : null}
      <div className="flex flex-wrap gap-2"><Button disabled={!studentId || !scheduledDate || !selectedUnits.length || busy} onClick={() => void save()}>{busy ? <LoaderCircle className="animate-spin" /> : <Plus />} {editingId ? "Lưu thay đổi" : "Thêm vào danh sách"}</Button>{editingId ? <Button variant="outline" onClick={reset}>Hủy sửa</Button> : null}</div>
    </CardContent></Card>
    <div><h2 className="mb-3 text-xl font-bold">Chờ kiểm tra <Badge variant="secondary">{pending.length}</Badge></h2>{pending.length ? <div className="grid gap-3 lg:grid-cols-2">{pending.map((item) => <Card key={item.id}><CardContent className="space-y-3 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{item.studentName}</p><p className="text-sm text-muted-foreground">{item.className || "Chưa xếp lớp"} · {item.level}</p></div><Badge variant="outline"><CalendarDays className="mr-1 size-3" />{item.scheduledDate.split("-").reverse().join("/")}</Badge></div><p className="text-sm"><strong>Unit:</strong> {unitLabels(item)}</p>{item.programCode && item.programCode !== currentProgram(item) ? <p className="text-sm text-amber-800">Trình độ đã thay đổi. Hãy sửa lịch và chọn lại Unit.</p> : null}<div className="flex flex-wrap gap-2"><Button size="sm" disabled={!queueUnitNumbers(item).length || Boolean(item.programCode && item.programCode !== currentProgram(item))} onClick={() => onOpen(item)}><ClipboardCheck /> Kiểm tra ngay</Button><Button size="sm" variant="outline" onClick={() => edit(item)}><Pencil /> Sửa</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => void remove(item)}><Trash2 /> Xóa</Button></div></CardContent></Card>)}</div> : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Chưa có học viên trong danh sách dự kiến.</p>}</div>
    {completed.length ? <div><h2 className="mb-3 text-xl font-bold">Đã kiểm tra</h2><div className="grid gap-3 lg:grid-cols-2">{completed.map((item) => <div key={item.id} className="rounded-xl border bg-white p-4"><strong>{item.studentName}</strong><p className="mt-1 text-sm text-muted-foreground">{item.scheduledDate.split("-").reverse().join("/")} · {unitLabels(item)}</p></div>)}</div></div> : null}
  </div>;
}
