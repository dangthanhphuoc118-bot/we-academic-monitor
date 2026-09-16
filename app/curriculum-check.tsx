"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Languages,
  LoaderCircle,
  MessageCircle,
  Pencil,
  RotateCcw,
  Save,
  Settings2,
  SlidersHorizontal,
  SpellCheck2,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { curriculumKey, programByLabel, programs, type CurriculumUnit, type ProgramGroup, type StudentCheckQueueItem } from "@/lib/curriculum";

type ClassInfo = { id: number; name: string; level: string; schedule: string; teacherName: string | null };
type StudentInfo = { id: number; name: string; classId: number | null; className: string | null; level: string };
export type LevelOption = { id: number; label: string; programCode: string; active: number; sortOrder: number };
export type FeedbackOption = { id: number; category: string; label: string; active: number; sortOrder: number };

async function send(action: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/academic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || "Không thể lưu dữ liệu.");
  return result;
}

function Picker({ value, onChange, placeholder, options, disabled = false }: { value: string; onChange: (value: string) => void; placeholder: string; options: { value: string; label: string }[]; disabled?: boolean }) {
  return <Select value={value || undefined} onValueChange={onChange} disabled={disabled}><SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
}

function ProgramBadge({ group, children }: { group: ProgramGroup; children: ReactNode }) {
  const tone = group === "baby" ? "border-rose-200 bg-rose-50 text-rose-700" : group === "super" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <Badge variant="outline" className={tone}>{children}</Badge>;
}

function EmptyBox({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Empty className="min-h-64 border bg-white/70"><EmptyHeader><EmptyMedia variant="icon"><ClipboardCheck /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{action ? <EmptyContent>{action}</EmptyContent> : null}</Empty>;
}

function NumberScore({ id, label, value, onChange, suffix = "%", max = 100, help }: { id: string; label: string; value: string; onChange: (value: string) => void; suffix?: string; max?: number; help?: string }) {
  const numeric = Math.min(max, Math.max(0, Number(value) || 0));
  return <div className="rounded-xl border bg-white p-4"><div className="flex items-start justify-between gap-3"><div><Label htmlFor={id} className="text-sm font-semibold">{label}</Label>{help ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{help}</p> : null}</div><div className="flex items-center gap-2"><Input id={id} type="number" inputMode="numeric" min={0} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="w-24 text-right font-bold" /><span className="text-sm font-semibold text-muted-foreground">{suffix}</span></div></div><Progress value={(numeric / Math.max(max, 1)) * 100} className="mt-3 h-1.5" /></div>;
}

function PronunciationChoice({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="rounded-xl border bg-white p-4"><div className="flex items-center gap-2"><Volume2 className="size-4 text-[#0b5c75]" /><p className="text-sm font-semibold">Pronunciation (Ending sound)</p></div><RadioGroup value={value} onValueChange={onChange} className="mt-3 grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "clear" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}><RadioGroupItem value="clear" className="sr-only" /><CheckCircle2 className="mx-auto mb-1 size-5" />CLEAR</label><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "unclear" ? "border-amber-400 bg-amber-50 text-amber-800" : "hover:bg-slate-50"}`}><RadioGroupItem value="unclear" className="sr-only" /><Volume2 className="mx-auto mb-1 size-5" />UNCLEAR</label></RadioGroup></div>;
}

function BinaryChoice({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="rounded-xl border bg-white p-4"><p className="text-sm font-semibold">{label}</p><RadioGroup value={value} onValueChange={onChange} className="mt-3 grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}><RadioGroupItem value="correct" className="sr-only" /><CheckCircle2 className="mx-auto mb-1 size-5" />ĐÚNG</label><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "incorrect" ? "border-rose-400 bg-rose-50 text-rose-700" : "hover:bg-slate-50"}`}><RadioGroupItem value="incorrect" className="sr-only" /><X className="mx-auto mb-1 size-5" />SAI</label></RadioGroup></div>;
}

export function CurriculumStudentCheck({ classes, students, curriculum, levelOptions, feedbackOptions, checkQueue, selectedClassId, setSelectedClassId, selectedStudentId, setSelectedStudentId, onSaved, openCurriculum, openFeedbackOptions, canManage = true }: { classes: ClassInfo[]; students: StudentInfo[]; curriculum: CurriculumUnit[]; levelOptions: LevelOption[]; feedbackOptions: FeedbackOption[]; checkQueue: StudentCheckQueueItem[]; selectedClassId: string; setSelectedClassId: (value: string) => void; selectedStudentId: string; setSelectedStudentId: (value: string) => void; onSaved: () => Promise<void> | void; openCurriculum: () => void; openFeedbackOptions: () => void; canManage?: boolean }) {
  const filteredStudents = students.filter((student) => !selectedClassId || String(student.classId) === selectedClassId);
  const student = students.find((item) => String(item.id) === selectedStudentId);
  const classInfo = classes.find((item) => String(item.id) === selectedClassId);
  const selectedLevel = student?.level || classInfo?.level || "";
  const configuredProgramCode = levelOptions.find((item) => item.label.toLowerCase() === selectedLevel.toLowerCase())?.programCode;
  const program = configuredProgramCode ? programs.find((item) => item.code === configuredProgramCode) : student ? programByLabel(student.level) ?? programByLabel(classInfo?.level || "") : undefined;
  const programUnits = curriculum.filter((unit) => unit.programCode === program?.code);
  const [unitNumber, setUnitNumber] = useState(programUnits[0] ? String(programUnits[0].unitNumber) : "");
  const unit = programUnits.find((item) => String(item.unitNumber) === unitNumber) ?? programUnits[0];
  const [checkedAt, setCheckedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<number[]>([]);
  const [spellingPercent, setSpellingPercent] = useState("");
  const [writingPercent, setWritingPercent] = useState("");
  const [vocabularyCorrect, setVocabularyCorrect] = useState("");
  const [communicationPercent, setCommunicationPercent] = useState("");
  const [patternPercent, setPatternPercent] = useState("");
  const [freestylePercent, setFreestylePercent] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [oneOrMany, setOneOrMany] = useState("");
  const [amIsAre, setAmIsAre] = useState("");
  const [saving, setSaving] = useState(false);

  const resetEvaluation = () => {
    setSpellingPercent(""); setWritingPercent(""); setVocabularyCorrect(""); setCommunicationPercent(""); setPatternPercent(""); setFreestylePercent(""); setPronunciation(""); setOneOrMany(""); setAmIsAre(""); setNotes(""); setSelectedFeedbackIds([]);
  };

  const percent = (value: string) => Math.min(100, Math.max(0, Number(value) || 0));
  const vocabularyPercent = unit?.vocabularyMax ? (Math.min(unit.vocabularyMax, Math.max(0, Number(vocabularyCorrect) || 0)) / unit.vocabularyMax) * 100 : 0;
  const overallPercent = (() => {
    if (!program) return 0;
    if (program.group === "baby") return (percent(spellingPercent) + percent(writingPercent)) / 2;
    if (program.group === "super") return (vocabularyPercent + percent(communicationPercent)) / 2;
    return (percent(patternPercent) + percent(freestylePercent)) / 2;
  })();

  const complete = program?.group === "baby"
    ? spellingPercent !== "" && writingPercent !== "" && Boolean(oneOrMany) && Boolean(amIsAre)
    : program?.group === "super"
      ? vocabularyCorrect !== "" && communicationPercent !== "" && Boolean(pronunciation)
      : patternPercent !== "" && freestylePercent !== "" && Boolean(pronunciation) && Boolean(oneOrMany) && Boolean(amIsAre);
  const hasRedflagComponent = program?.group === "baby"
    ? percent(spellingPercent) < 50 || percent(writingPercent) < 50
    : program?.group === "super"
      ? vocabularyPercent < 70 || percent(communicationPercent) < 60
      : percent(patternPercent) < 60 || percent(freestylePercent) < 60;
  const previewResult = !complete ? "Chưa đủ dữ liệu" : hasRedflagComponent ? "Redflag" : overallPercent > 80 ? "Good" : "Average";
  const pendingForDate = checkQueue.filter((item) => item.scheduledDate === checkedAt && item.status === "pending");
  const queueGroups = Array.from(new Set(pendingForDate.map((item) => item.className || "Chưa xếp lớp"))).map((className) => ({ className, rows: pendingForDate.filter((item) => (item.className || "Chưa xếp lớp") === className) }));

  const save = async () => {
    if (!student || !program || !unit || !complete) return;
    const evaluation = program.group === "baby"
      ? { spellingPercent: Number(spellingPercent), writingPercent: Number(writingPercent), oneOrMany, amIsAre }
      : program.group === "super"
        ? { vocabularyCorrect: Number(vocabularyCorrect), vocabularyMax: unit.vocabularyMax, communicationPercent: Number(communicationPercent), pronunciation }
        : { patternPercent: Number(patternPercent), freestylePercent: Number(freestylePercent), pronunciation, oneOrMany, amIsAre };
    const nextQueued = pendingForDate.find((item) => item.studentId !== student.id);
    setSaving(true);
    try {
      const feedback = feedbackOptions.filter((item) => selectedFeedbackIds.includes(item.id)).map((item) => item.label);
      await send("createLearningCheck", { studentId: student.id, programCode: program.code, unitNumber: unit.unitNumber, checkedAt, evaluation, feedback, notes });
      await onSaved();
      toast.success("Đã lưu kết quả đánh giá học viên.");
      setNotes(""); setSelectedFeedbackIds([]);
      if (nextQueued) {
        setSelectedClassId(nextQueued.classId ? String(nextQueued.classId) : "");
        resetEvaluation();
        setSelectedStudentId(String(nextQueued.studentId));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
    <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#d95c25]">Teacher Evaluation</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Đánh giá tình hình học viên</h1><p className="mt-1 text-sm leading-6 text-muted-foreground">Nội dung và tiêu chí thay đổi tự động theo chương trình của học viên.</p></div>
    <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="gap-3 border-b sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-lg">Danh sách chờ kiểm tra</CardTitle><p className="mt-1 text-sm text-muted-foreground">Đã nhóm theo lớp cho ngày {new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${checkedAt}T00:00:00+07:00`))}.</p></div><Badge variant="secondary">{pendingForDate.length} học viên</Badge></CardHeader><CardContent className="p-5">{queueGroups.length ? <div className="grid gap-4 lg:grid-cols-2">{queueGroups.map((group) => <div key={group.className} className="rounded-xl border bg-slate-50/70 p-3"><div className="mb-3 flex items-center justify-between"><p className="font-bold text-[#0b5c75]">{group.className}</p><Badge variant="outline">{group.rows.length}</Badge></div><div className="space-y-2">{group.rows.map((item) => <div key={item.id} className={`flex items-center gap-2 rounded-lg border bg-white p-2 ${item.studentId === student?.id ? "border-[#2bb5c8] ring-2 ring-[#2bb5c8]/15" : ""}`}><button type="button" className="min-w-0 flex-1 text-left" onClick={() => { setSelectedClassId(item.classId ? String(item.classId) : ""); resetEvaluation(); setSelectedStudentId(String(item.studentId)); }}><p className="truncate text-sm font-semibold">{item.studentName}</p><p className="truncate text-xs text-muted-foreground">{item.level}</p></button><Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Bỏ ${item.studentName} khỏi danh sách`} onClick={async () => { try { await send("removeStudentCheck", { id: item.id }); await onSaved(); toast.success("Đã bỏ học viên khỏi danh sách chờ."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể cập nhật danh sách."); } }}><X /></Button></div>)}</div></div>)}</div> : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có học viên được xếp lịch cho ngày này. Bạn có thể chọn nhiều học viên tại trang Lớp học.</p>}</CardContent></Card>
    <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="grid gap-4 p-5 lg:grid-cols-3"><div><Label className="mb-2">1. Lớp học</Label><Picker value={selectedClassId} onChange={(value) => { setSelectedClassId(value); resetEvaluation(); setSelectedStudentId(""); }} placeholder="Chọn lớp" options={classes.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.level}` }))} /></div><div><Label className="mb-2">2. Học viên</Label><Picker value={selectedStudentId} onChange={(value) => { resetEvaluation(); setSelectedStudentId(value); }} placeholder="Chọn học viên" disabled={!selectedClassId} options={filteredStudents.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.level}` }))} /></div><div><Label className="mb-2">3. Nội dung kiểm tra</Label><Picker value={unit ? String(unit.unitNumber) : ""} onChange={(value) => { setUnitNumber(value); resetEvaluation(); }} placeholder="Chọn unit / ngày" disabled={!program} options={programUnits.map((item) => ({ value: String(item.unitNumber), label: `${item.unitLabel} · ${item.topic}` }))} /></div></CardContent></Card>
    {student && !program ? <EmptyBox title="Chưa xác định đúng chương trình" description={`Học viên đang được đặt trình độ “${student.level}”. Hãy chỉnh thành Baby Stars, Super Kids 1–8, Starters, Movers hoặc Flyers.`} /> : null}
    {student && program && unit ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
      <div className="space-y-5"><CurriculumReference unit={unit} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-xl">Evaluation Criteria</CardTitle><p className="mt-1 text-sm text-muted-foreground">{student.name} · {classInfo?.name}</p></div><ProgramBadge group={program.group}>{program.label}</ProgramBadge></div></CardHeader><CardContent className="space-y-4 p-5">
        {program.group === "baby" ? <><div className="grid gap-3 sm:grid-cols-2"><NumberScore id="spelling" label="SPELLING" value={spellingPercent} onChange={setSpellingPercent} help="Dưới 50% là Redflag; 50–80% là Average; trên 80% là Good." /><NumberScore id="writing" label="WRITING" value={writingPercent} onChange={setWritingPercent} help="Dưới 50% là Redflag; 50–80% là Average; trên 80% là Good." /></div><div className="grid gap-3 sm:grid-cols-2"><BinaryChoice label="ONE OR MANY" value={oneOrMany} onChange={setOneOrMany} /><BinaryChoice label="AM – IS – ARE" value={amIsAre} onChange={setAmIsAre} /></div></> : null}
        {program.group === "super" ? <><NumberScore id="vocabulary" label="VOCABULARY" value={vocabularyCorrect} onChange={setVocabularyCorrect} max={unit.vocabularyMax || 10} suffix={`/ ${unit.vocabularyMax || 10}`} help="Dưới 70% là Redflag; 70–80% là Average; trên 80% là Good." /><NumberScore id="communication" label="COMMUNICATION" value={communicationPercent} onChange={setCommunicationPercent} help="Dưới 60% là Redflag; 60–80% là Average; trên 80% là Good." /><PronunciationChoice value={pronunciation} onChange={setPronunciation} /></> : null}
        {program.group === "cambridge" ? <><div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">COMMUNICATION</div><div className="grid gap-3 sm:grid-cols-2"><NumberScore id="pattern" label="PATTERN" value={patternPercent} onChange={setPatternPercent} help="Dưới 60% là Redflag; 60–80% là Average; trên 80% là Good." /><NumberScore id="freestyle" label="FREESTYLE" value={freestylePercent} onChange={setFreestylePercent} help="Dưới 60% là Redflag; 60–80% là Average; trên 80% là Good." /></div><PronunciationChoice value={pronunciation} onChange={setPronunciation} /><div className="grid gap-3 sm:grid-cols-2"><BinaryChoice label="ONE OR MANY" value={oneOrMany} onChange={setOneOrMany} /><BinaryChoice label="AM – IS – ARE" value={amIsAre} onChange={setAmIsAre} /></div></> : null}
      </CardContent></Card></div>
      <Card className="h-fit border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">Kết quả kiểm tra</CardTitle><Badge className="bg-[#ff7a3d]">{(overallPercent / 20).toFixed(1)}/5</Badge></div><Progress value={overallPercent} className="mt-3" /><div className="flex justify-between text-xs text-muted-foreground"><span>{Math.round(overallPercent)}%</span><span className="font-semibold text-foreground">{previewResult}</span></div></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="check-date">Ngày đánh giá</Label><Input id="check-date" type="date" value={checkedAt} onChange={(event) => setCheckedAt(event.target.value)} /></div><div className="space-y-3"><div className="flex items-center justify-between gap-3"><Label>Nhận xét thường gặp</Label>{canManage ? <Button type="button" size="sm" variant="ghost" onClick={openFeedbackOptions}><Settings2 /> Quản lý</Button> : null}</div>{feedbackOptions.filter((item) => item.active).length ? <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border bg-slate-50/70 p-3">{Array.from(new Set(feedbackOptions.filter((item) => item.active).map((item) => item.category))).map((category) => <div key={category}><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{category}</p><div className="space-y-2">{feedbackOptions.filter((item) => item.active && item.category === category).map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-lg bg-white p-2.5 text-sm leading-5 shadow-sm"><Checkbox checked={selectedFeedbackIds.includes(item.id)} onCheckedChange={(checked) => setSelectedFeedbackIds((current) => checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span>{item.label}</span></label>)}</div></div>)}</div> : canManage ? <Button type="button" variant="outline" className="w-full" onClick={openFeedbackOptions}><Settings2 /> Thêm mẫu nhận xét</Button> : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Chưa có mẫu nhận xét đang sử dụng.</p>}</div><div><Label htmlFor="check-notes">Nhận xét / lý do khác</Label><Textarea id="check-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Nhập nội dung khác ngoài các lựa chọn phía trên..." /></div><Button className="w-full bg-[#ff7a3d] hover:bg-[#e9652f]" disabled={!complete || saving} onClick={save}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu đánh giá</Button></CardContent></Card>
    </div> : null}
    {!student ? <EmptyBox title="Chọn lớp và học viên" description="Hệ thống sẽ hiển thị đúng unit, nội dung học và tiêu chí đánh giá tương ứng." action={canManage ? <Button variant="outline" onClick={openCurriculum}><BookOpen /> Xem toàn bộ khung chương trình</Button> : undefined} /> : null}
  </div>;
}

function CurriculumReference({ unit }: { unit: CurriculumUnit }) {
  return <Card className="overflow-hidden border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><div className={`h-1.5 ${unit.group === "baby" ? "bg-rose-400" : unit.group === "super" ? "bg-amber-400" : "bg-emerald-500"}`} /><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><ProgramBadge group={unit.group}>{unit.programLabel}</ProgramBadge><Badge variant="outline">{unit.series}</Badge></div><CardTitle className="mt-3 text-xl">{unit.unitLabel}: {unit.topic}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{unit.dayStart === unit.dayEnd ? `Buổi ${unit.dayStart}` : `Buổi ${unit.dayStart}–${unit.dayEnd}`} · {unit.content}</p></div>{unit.isOverride ? <Badge variant="secondary"><SlidersHorizontal /> Đã điều chỉnh</Badge> : null}</div></CardHeader><CardContent className="grid gap-4 lg:grid-cols-2">{unit.vocabulary ? <ReferenceBlock icon={<Languages />} title="Vocabulary" content={unit.vocabulary} itemized /> : null}{unit.grammar ? <ReferenceBlock icon={<MessageCircle />} title={unit.group === "cambridge" ? "Communication guidance" : "Grammar / Communication"} content={unit.grammar} /> : null}{unit.writingRef ? <ReferenceBlock icon={<SpellCheck2 />} title="Writing reference" content={unit.writingRef} /> : null}{unit.group === "baby" ? <ReferenceBlock icon={<BookOpen />} title="Lesson content" content={unit.content} /> : null}</CardContent></Card>;
}

function ReferenceBlock({ icon, title, content, itemized = false }: { icon: ReactNode; title: string; content: string; itemized?: boolean }) {
  const items = itemized ? content.split(/\s+-\s+|;\s*/).map((item) => item.trim()).filter(Boolean) : [];
  return <div className="rounded-xl border bg-slate-50/80 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0b5c75]"><span className="[&_svg]:size-4">{icon}</span>{title}</div>{items.length ? <div className="flex flex-wrap gap-2">{items.map((item, index) => <span key={`${item}-${index}`} className="rounded-lg border bg-white px-2.5 py-1.5 text-sm leading-5 text-[#345064] shadow-sm">{item}</span>)}</div> : <p className="whitespace-pre-line text-sm leading-6 text-[#345064]">{content}</p>}</div>;
}

export function CurriculumManager({ curriculum, onReload }: { curriculum: CurriculumUnit[]; onReload: () => Promise<void> | void }) {
  const [programCode, setProgramCode] = useState(programs[0].code);
  const [editing, setEditing] = useState<CurriculumUnit | null>(null);
  const [resetting, setResetting] = useState<CurriculumUnit | null>(null);
  const selectedProgram = programs.find((program) => program.code === programCode)!;
  const rows = curriculum.filter((unit) => unit.programCode === programCode);

  const reset = async () => {
    if (!resetting) return;
    try { await send("resetCurriculumUnit", { programCode: resetting.programCode, unitNumber: resetting.unitNumber }); await onReload(); toast.success("Đã khôi phục nội dung gốc từ tài liệu."); setResetting(null); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể khôi phục."); }
  };

  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#d95c25]">Curriculum Library</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nội dung khung đánh giá</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Toàn bộ nội dung từ 12 tài liệu đã được đưa vào hệ thống. Vocabulary và Grammar / Communication được hiển thị riêng để dễ kiểm tra và chỉnh sửa.</p></div><div className="w-full sm:w-72"><Label className="mb-2">Chương trình</Label><Picker value={programCode} onChange={setProgramCode} placeholder="Chọn chương trình" options={programs.map((program) => ({ value: program.code, label: curriculum.find((unit) => unit.programCode === program.code)?.programLabel || program.label }))} /></div></div>
    <div className={`rounded-2xl border p-5 ${selectedProgram.group === "baby" ? "border-rose-200 bg-rose-50" : selectedProgram.group === "super" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-bold">{rows[0]?.programLabel || selectedProgram.label}</p><p className="text-sm text-muted-foreground">{selectedProgram.series} · {selectedProgram.lessons} buổi</p></div><ProgramBadge group={selectedProgram.group}>{rows.length} nội dung kiểm tra</ProgramBadge></div></div>
    <div className="space-y-4">{rows.map((unit) => <Card key={curriculumKey(unit.programCode, unit.unitNumber)} className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="gap-3 border-b sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{unit.unitLabel}</Badge><span className="text-xs text-muted-foreground">{unit.dayStart === unit.dayEnd ? `Buổi ${unit.dayStart}` : `Buổi ${unit.dayStart}–${unit.dayEnd}`}</span></div><CardTitle className="mt-2 text-lg">{unit.topic}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{unit.content}</p></div><div className="flex shrink-0 items-center gap-2"><Badge variant="outline">{unit.group === "baby" ? "Spelling · Writing" : unit.group === "super" ? `Vocab /${unit.vocabularyMax} · Giao tiếp` : "Pattern · Freestyle"}</Badge><Button size="icon-sm" variant="ghost" onClick={() => setEditing(unit)} aria-label={`Sửa ${unit.unitLabel}`}><Pencil /></Button>{unit.isOverride ? <Button size="icon-sm" variant="ghost" onClick={() => setResetting(unit)} aria-label={`Khôi phục ${unit.unitLabel}`}><RotateCcw /></Button> : null}</div></CardHeader><CardContent className="grid gap-4 pt-5 lg:grid-cols-2">{unit.vocabulary ? <ReferenceBlock icon={<Languages />} title="Vocabulary" content={unit.vocabulary} itemized /> : null}{unit.grammar ? <ReferenceBlock icon={<MessageCircle />} title={unit.group === "cambridge" ? "Communication" : "Grammar / Communication"} content={unit.grammar} /> : null}{unit.writingRef ? <ReferenceBlock icon={<SpellCheck2 />} title="Writing reference" content={unit.writingRef} /> : null}{!unit.vocabulary && !unit.grammar ? <ReferenceBlock icon={<BookOpen />} title="Lesson content" content={unit.content} /> : null}</CardContent></Card>)}</div>
    {editing ? <CurriculumEditor key={curriculumKey(editing.programCode, editing.unitNumber)} unit={editing} onClose={() => setEditing(null)} onSaved={async () => { await onReload(); setEditing(null); }} /> : null}
    <AlertDialog open={Boolean(resetting)} onOpenChange={(open) => { if (!open) setResetting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Khôi phục nội dung gốc?</AlertDialogTitle><AlertDialogDescription>Mọi điều chỉnh tại {resetting?.unitLabel} sẽ được thay bằng nội dung lấy từ file chương trình ban đầu.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={reset}>Khôi phục</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function CurriculumEditor({ unit, onClose, onSaved }: { unit: CurriculumUnit; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [topic, setTopic] = useState(unit.topic); const [content, setContent] = useState(unit.content); const [vocabulary, setVocabulary] = useState(unit.vocabulary); const [grammar, setGrammar] = useState(unit.grammar); const [vocabularyMax, setVocabularyMax] = useState(String(unit.vocabularyMax)); const [writingRef, setWritingRef] = useState(unit.writingRef); const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await send("updateCurriculumUnit", { programCode: unit.programCode, unitNumber: unit.unitNumber, topic, content, vocabulary, grammar, vocabularyMax: Number(vocabularyMax), writingRef }); await onSaved(); toast.success("Đã cập nhật khung chương trình."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu."); } finally { setSaving(false); } };
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa {unit.programLabel} · {unit.unitLabel}</DialogTitle><DialogDescription>Nội dung chỉnh sửa sẽ thay thế bản gốc khi giáo viên mở phiếu đánh giá.</DialogDescription></DialogHeader><div className="grid gap-4 py-2"><Field label="Chủ đề"><Input value={topic} onChange={(event) => setTopic(event.target.value)} /></Field><Field label="Nội dung"><Input value={content} onChange={(event) => setContent(event.target.value)} /></Field><Field label="Vocabulary"><Textarea value={vocabulary} onChange={(event) => setVocabulary(event.target.value)} rows={6} /></Field><Field label={unit.group === "cambridge" ? "Communication guidance" : "Grammar / Communication"}><Textarea value={grammar} onChange={(event) => setGrammar(event.target.value)} rows={5} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Tổng số từ vựng"><Input type="number" min={0} value={vocabularyMax} onChange={(event) => setVocabularyMax(event.target.value)} /></Field><Field label="Writing reference"><Input value={writingRef} onChange={(event) => setWritingRef(event.target.value)} placeholder="VD: Writing p.1&2" /></Field></div></div><DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={save} disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu nội dung</Button></DialogFooter></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
