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
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Volume2,
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
import { cambridgeColumnPercent, isCompleteCambridgeEvaluation, normalizeCambridgeEvaluation, type CambridgeBinary, type CambridgePronunciation } from "@/lib/cambridge-evaluation";
import { curriculumDefaults, curriculumKey, programByLabel, programs, type CurriculumUnit, type LearningCheck, type ProgramGroup } from "@/lib/curriculum";
import {
  defaultFreestyleBanks,
  flattenFreestyleCategories,
  sampleFreestyleQuestionsByType,
  splitFreestyleQuestions,
  type FreestyleBank,
  type FreestyleQuestionCategory,
  type SpeakingProgramCode,
} from "@/lib/speaking-questions";
import { vietnamToday } from "@/lib/weekly-history";
import { parseVocabularyGroups } from "@/lib/vocabulary";

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

function NumberScore({ id, label, value, onChange, suffix = "%", max = 100 }: { id: string; label: string; value: string; onChange: (value: string) => void; suffix?: string; max?: number }) {
  const numeric = Math.min(max, Math.max(0, Number(value) || 0));
  return <div className="rounded-xl border bg-white p-4"><div className="flex items-start justify-between gap-3"><Label htmlFor={id} className="text-sm font-semibold">{label}</Label><div className="flex items-center gap-2"><Input id={id} type="number" inputMode="numeric" min={0} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="w-24 text-right font-bold" /><span className="text-sm font-semibold text-muted-foreground">{suffix}</span></div></div><Progress value={(numeric / Math.max(max, 1)) * 100} className="mt-3 h-1.5" /></div>;
}

function PronunciationChoice({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="rounded-xl border bg-white p-4"><div className="flex items-center gap-2"><Volume2 className="size-4 text-[#0b5c75]" /><p className="text-sm font-semibold">Pronunciation (Ending sound)</p></div><RadioGroup value={value} onValueChange={onChange} className="mt-3 grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "clear" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}><RadioGroupItem value="clear" className="sr-only" /><CheckCircle2 className="mx-auto mb-1 size-5" />CLEAR</label><label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition ${value === "unclear" ? "border-amber-400 bg-amber-50 text-amber-800" : "hover:bg-slate-50"}`}><RadioGroupItem value="unclear" className="sr-only" /><Volume2 className="mx-auto mb-1 size-5" />UNCLEAR</label></RadioGroup></div>;
}

function MatrixChoice({ label, value, onChange, pronunciation = false }: { label: string; value: string; onChange: (value: string) => void; pronunciation?: boolean }) {
  const positive = pronunciation ? "clear" : "correct";
  const negative = pronunciation ? "unclear" : "incorrect";
  return <RadioGroup aria-label={label} value={value} onValueChange={onChange} className="grid min-w-48 grid-cols-2 gap-1.5"><label className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-[11px] font-bold transition ${value === positive ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "bg-white text-slate-500 hover:bg-slate-50"}`}><RadioGroupItem value={positive} className="sr-only" />{pronunciation ? "CLEAR" : "CORRECT"}</label><label className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-[11px] font-bold transition ${value === negative ? "border-rose-300 bg-rose-50 text-rose-700" : "bg-white text-slate-500 hover:bg-slate-50"}`}><RadioGroupItem value={negative} className="sr-only" />{pronunciation ? "UNCLEAR" : "INCORRECT"}</label></RadioGroup>;
}

function CambridgeEvaluationMatrix({ patternPronunciation, setPatternPronunciation, freePronunciation, setFreePronunciation, patternOneOrMany, setPatternOneOrMany, freeOneOrMany, setFreeOneOrMany, patternAmIsAre, setPatternAmIsAre, freeAmIsAre, setFreeAmIsAre }: {
  patternPronunciation: string; setPatternPronunciation: (value: string) => void;
  freePronunciation: string; setFreePronunciation: (value: string) => void;
  patternOneOrMany: string; setPatternOneOrMany: (value: string) => void;
  freeOneOrMany: string; setFreeOneOrMany: (value: string) => void;
  patternAmIsAre: string; setPatternAmIsAre: (value: string) => void;
  freeAmIsAre: string; setFreeAmIsAre: (value: string) => void;
}) {
  return <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[620px] border-collapse text-sm"><thead><tr className="bg-slate-50"><th className="w-40 border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tiêu chí</th><th className="border-b px-3 py-3 text-left font-bold text-[#143b63]">Pattern</th><th className="border-b px-3 py-3 text-left font-bold text-[#143b63]">Free</th></tr></thead><tbody><tr><th className="border-b px-4 py-3 text-left font-semibold">Pronunciation</th><td className="border-b px-3 py-3"><MatrixChoice label="Pattern pronunciation" value={patternPronunciation} onChange={setPatternPronunciation} pronunciation /></td><td className="border-b px-3 py-3"><MatrixChoice label="Free pronunciation" value={freePronunciation} onChange={setFreePronunciation} pronunciation /></td></tr><tr><th className="border-b px-4 py-3 text-left font-semibold">One / Many</th><td className="border-b px-3 py-3"><MatrixChoice label="Pattern one or many" value={patternOneOrMany} onChange={setPatternOneOrMany} /></td><td className="border-b px-3 py-3"><MatrixChoice label="Free one or many" value={freeOneOrMany} onChange={setFreeOneOrMany} /></td></tr><tr><th className="px-4 py-3 text-left font-semibold">Am / Is / Are</th><td className="px-3 py-3"><MatrixChoice label="Pattern am is are" value={patternAmIsAre} onChange={setPatternAmIsAre} /></td><td className="px-3 py-3"><MatrixChoice label="Free am is are" value={freeAmIsAre} onChange={setFreeAmIsAre} /></td></tr></tbody></table></div>;
}

function FreestyleQuestionColumn({ title, questions, className = "" }: { title: string; questions: string[]; className?: string }) {
  return <div className={`min-h-36 p-4 ${className}`}><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold tracking-[0.12em] text-[#143b63]">{title}</p><Badge variant="secondary" className="rounded-md">{questions.length}</Badge></div>{questions.length ? <ol className="space-y-2 pl-5 text-sm leading-6">{questions.map((question, index) => <li key={`${question}-${index}`} className="list-decimal pl-1">{question}</li>)}</ol> : <p className="text-sm text-muted-foreground">Không có câu thuộc nhóm này.</p>}</div>;
}

function parseObject(value?: string) {
  try { return value ? JSON.parse(value) as Record<string, unknown> : {}; } catch { return {}; }
}

function parseList(value?: string) {
  try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

type StudentCheckProps = {
  classes: ClassInfo[];
  students: StudentInfo[];
  curriculum: CurriculumUnit[];
  freestyleBanks: FreestyleBank[];
  levelOptions: LevelOption[];
  feedbackOptions: FeedbackOption[];
  selectedClassId: string;
  setSelectedClassId: (value: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (value: string) => void;
  onSaved: () => Promise<void> | void;
  openFeedbackOptions: () => void;
  canManage?: boolean;
  embedded?: boolean;
  editingCheck?: LearningCheck | null;
  initialCheckedAt?: string;
};

export function CurriculumStudentCheck({ classes, students, curriculum, freestyleBanks, levelOptions, feedbackOptions, selectedClassId, setSelectedClassId, selectedStudentId, setSelectedStudentId, onSaved, openFeedbackOptions, canManage = true, embedded = false, editingCheck = null, initialCheckedAt }: StudentCheckProps) {
  const initialEvaluation = parseObject(editingCheck?.evaluationJson);
  const initialCambridge = normalizeCambridgeEvaluation(initialEvaluation);
  const initialFeedback = parseList(editingCheck?.feedbackJson);
  const filteredStudents = students.filter((student) => !selectedClassId || String(student.classId) === selectedClassId);
  const student = students.find((item) => String(item.id) === selectedStudentId);
  const classInfo = classes.find((item) => String(item.id) === selectedClassId);
  const selectedLevel = student?.level || "";
  const configuredProgramCode = levelOptions.find((item) => item.label.toLowerCase() === selectedLevel.toLowerCase())?.programCode;
  const program = editingCheck ? programs.find((item) => item.code === editingCheck.programCode) : configuredProgramCode ? programs.find((item) => item.code === configuredProgramCode) : student ? programByLabel(student.level) : undefined;
  const programUnits = curriculum.filter((unit) => unit.programCode === program?.code);
  const speakingProgramCode = program?.group === "cambridge" ? program.code as SpeakingProgramCode : null;
  const freestyleBank = speakingProgramCode ? freestyleBanks.find((bank) => bank.programCode === speakingProgramCode) : undefined;
  const levelFreestyleCategories = speakingProgramCode
    ? freestyleBank?.categories ?? defaultFreestyleBanks[speakingProgramCode]
    : [];
  const levelFreestyleQuestions = speakingProgramCode
    ? flattenFreestyleCategories(levelFreestyleCategories)
    : [];
  const [unitNumber, setUnitNumber] = useState(editingCheck ? String(editingCheck.unitNumber) : (programUnits[0] ? String(programUnits[0].unitNumber) : ""));
  const unit = programUnits.find((item) => String(item.unitNumber) === unitNumber) ?? programUnits[0];
  const [checkedAt, setCheckedAt] = useState(editingCheck?.checkedAt || initialCheckedAt || vietnamToday());
  const [notes, setNotes] = useState(editingCheck?.notes || "");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<number[]>(feedbackOptions.filter((item) => initialFeedback.includes(item.label)).map((item) => item.id));
  const [spellingPercent, setSpellingPercent] = useState(String(initialEvaluation.spellingPercent ?? ""));
  const [writingPercent, setWritingPercent] = useState(String(initialEvaluation.writingPercent ?? ""));
  const [vocabularyCorrect, setVocabularyCorrect] = useState(String(initialEvaluation.vocabularyCorrect ?? ""));
  const [communicationPercent, setCommunicationPercent] = useState(String(initialEvaluation.communicationPercent ?? ""));
  const [pronunciation, setPronunciation] = useState(String(initialEvaluation.pronunciation ?? ""));
  const [patternPronunciation, setPatternPronunciation] = useState<string>(initialCambridge.pattern.pronunciation);
  const [freePronunciation, setFreePronunciation] = useState<string>(initialCambridge.free.pronunciation);
  const [patternOneOrMany, setPatternOneOrMany] = useState<string>(initialCambridge.pattern.oneOrMany);
  const [freeOneOrMany, setFreeOneOrMany] = useState<string>(initialCambridge.free.oneOrMany);
  const [patternAmIsAre, setPatternAmIsAre] = useState<string>(initialCambridge.pattern.amIsAre);
  const [freeAmIsAre, setFreeAmIsAre] = useState<string>(initialCambridge.free.amIsAre);
  const savedFreestyleQuestions = Array.isArray(initialEvaluation.freestyleQuestions) ? initialEvaluation.freestyleQuestions.filter((item): item is string => typeof item === "string") : [];
  const [freestyleQuestions, setFreestyleQuestions] = useState<string[]>(savedFreestyleQuestions.length ? savedFreestyleQuestions : program?.group === "cambridge" ? sampleFreestyleQuestionsByType(levelFreestyleCategories) : []);
  const [saving, setSaving] = useState(false);

  const resetEvaluation = () => {
    setSpellingPercent(""); setWritingPercent(""); setVocabularyCorrect(""); setCommunicationPercent(""); setPronunciation(""); setPatternPronunciation(""); setFreePronunciation(""); setPatternOneOrMany(""); setFreeOneOrMany(""); setPatternAmIsAre(""); setFreeAmIsAre(""); setNotes(""); setSelectedFeedbackIds([]);
    setFreestyleQuestions(program?.group === "cambridge" ? sampleFreestyleQuestionsByType(levelFreestyleCategories) : []);
  };

  const percent = (value: string) => Math.min(100, Math.max(0, Number(value) || 0));
  const vocabularyPercent = unit?.vocabularyMax ? (Math.min(unit.vocabularyMax, Math.max(0, Number(vocabularyCorrect) || 0)) / unit.vocabularyMax) * 100 : 0;
  const cambridgeEvaluation = {
    pattern: { pronunciation: patternPronunciation as CambridgePronunciation | "", oneOrMany: patternOneOrMany as CambridgeBinary | "", amIsAre: patternAmIsAre as CambridgeBinary | "" },
    free: { pronunciation: freePronunciation as CambridgePronunciation | "", oneOrMany: freeOneOrMany as CambridgeBinary | "", amIsAre: freeAmIsAre as CambridgeBinary | "" },
  };
  const patternPercent = cambridgeColumnPercent(cambridgeEvaluation.pattern);
  const freestylePercent = cambridgeColumnPercent(cambridgeEvaluation.free);
  const overallPercent = !program ? 0 : program.group === "baby" ? (percent(spellingPercent) + percent(writingPercent)) / 2 : program.group === "super" ? (vocabularyPercent + percent(communicationPercent)) / 2 : (patternPercent + freestylePercent) / 2;
  const complete = program?.group === "baby" ? spellingPercent !== "" && writingPercent !== "" : program?.group === "super" ? vocabularyCorrect !== "" && communicationPercent !== "" && Boolean(pronunciation) : freestyleQuestions.length === 5 && isCompleteCambridgeEvaluation(cambridgeEvaluation);
  const hasRedflagComponent = program?.group === "baby" ? percent(spellingPercent) < 50 || percent(writingPercent) < 50 : program?.group === "super" ? vocabularyPercent < 70 || percent(communicationPercent) < 60 : patternPercent < 60 || freestylePercent < 60;
  const previewResult = !complete ? "Chưa đủ dữ liệu" : hasRedflagComponent ? "Redflag" : overallPercent > 80 ? "Good" : "Average";
  const groupedFreestyleQuestions = splitFreestyleQuestions(freestyleQuestions, levelFreestyleCategories);

  const save = async () => {
    if (!student || !program || !unit || !complete) return;
    const evaluation = program.group === "baby"
      ? { spellingPercent: Number(spellingPercent), writingPercent: Number(writingPercent) }
      : program.group === "super"
        ? { vocabularyCorrect: Number(vocabularyCorrect), vocabularyMax: unit.vocabularyMax, communicationPercent: Number(communicationPercent), pronunciation }
        : { pattern: cambridgeEvaluation.pattern, free: cambridgeEvaluation.free, freestyleQuestions };
    const preservedFeedback = initialFeedback.filter((label) => !feedbackOptions.some((option) => option.label === label));
    const feedback = Array.from(new Set([...preservedFeedback, ...feedbackOptions.filter((item) => selectedFeedbackIds.includes(item.id)).map((item) => item.label)]));
    setSaving(true);
    try {
      await send(editingCheck ? "updateLearningCheck" : "createLearningCheck", { ...(editingCheck ? { id: editingCheck.id } : {}), studentId: student.id, programCode: program.code, unitNumber: unit.unitNumber, checkedAt, evaluation, feedback, notes });
      await onSaved();
      toast.success(editingCheck ? "Đã cập nhật kết quả đánh giá." : "Đã lưu kết quả đánh giá học viên.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
    {!embedded ? <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#2f6f9f]">Teacher Evaluation</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Đánh giá tình hình học viên</h1><p className="mt-1 text-sm leading-6 text-muted-foreground">Nội dung và tiêu chí thay đổi tự động theo chương trình của học viên.</p></div> : null}
    {embedded ? <Card className="border-0 bg-slate-50 shadow-none"><CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)]"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Học viên đã chọn</p><p className="mt-1 font-bold text-[#102233]">{student?.name}</p><p className="text-sm text-muted-foreground">{classInfo?.name || "Chưa xếp lớp"} · {student?.level}</p></div><div><Label className="mb-2">Nội dung kiểm tra</Label><Picker value={unit ? String(unit.unitNumber) : ""} onChange={(value) => { setUnitNumber(value); resetEvaluation(); }} placeholder="Chọn unit / ngày" disabled={!program || Boolean(editingCheck)} options={programUnits.map((item) => ({ value: String(item.unitNumber), label: `${item.unitLabel} · ${item.topic}` }))} /></div></CardContent></Card> : <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="grid gap-4 p-5 lg:grid-cols-3"><div><Label className="mb-2">1. Lớp học</Label><Picker value={selectedClassId} onChange={(value) => { setSelectedClassId(value); resetEvaluation(); setSelectedStudentId(""); }} placeholder="Chọn lớp" options={classes.map((item) => ({ value: String(item.id), label: item.name }))} /></div><div><Label className="mb-2">2. Học viên</Label><Picker value={selectedStudentId} onChange={(value) => { resetEvaluation(); setSelectedStudentId(value); }} placeholder="Chọn học viên" disabled={!selectedClassId} options={filteredStudents.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.level}` }))} /></div><div><Label className="mb-2">3. Nội dung kiểm tra</Label><Picker value={unit ? String(unit.unitNumber) : ""} onChange={(value) => { setUnitNumber(value); resetEvaluation(); }} placeholder="Chọn unit / ngày" disabled={!program} options={programUnits.map((item) => ({ value: String(item.unitNumber), label: `${item.unitLabel} · ${item.topic}` }))} /></div></CardContent></Card>}
    {student && !program ? <EmptyBox title="Chưa xác định đúng chương trình" description={`Học viên đang được đặt trình độ “${student.level}”. Hãy chỉnh thành Baby Stars, Super Kids 1–8, Starters, Movers hoặc Flyers.`} /> : null}
    {student && program && unit ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
      <div className="space-y-5"><CurriculumReference unit={unit} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-xl">Evaluation Criteria</CardTitle><p className="mt-1 text-sm text-muted-foreground">{student.name} · {classInfo?.name}</p></div><ProgramBadge group={program.group}>{program.label}</ProgramBadge></div></CardHeader><CardContent className="space-y-4 p-5">
        {program.group === "baby" ? <div className="grid gap-3 sm:grid-cols-2"><NumberScore id="spelling" label="SPELLING" value={spellingPercent} onChange={setSpellingPercent} /><NumberScore id="writing" label="WRITING" value={writingPercent} onChange={setWritingPercent} /></div> : null}
        {program.group === "super" ? <><NumberScore id="vocabulary" label="VOCABULARY" value={vocabularyCorrect} onChange={setVocabularyCorrect} max={unit.vocabularyMax || 10} suffix={`/ ${unit.vocabularyMax || 10}`} /><NumberScore id="communication" label="COMMUNICATION" value={communicationPercent} onChange={setCommunicationPercent} /><PronunciationChoice value={pronunciation} onChange={setPronunciation} /></> : null}
        {program.group === "cambridge" ? <><div className="rounded-lg bg-sky-50 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">Communication</div><div className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"><div><p className="text-sm font-bold">Freestyle questions</p><p className="mt-0.5 text-xs text-muted-foreground">5 câu từ ngân hàng chung của level {program.label}, phân theo dạng câu hỏi.</p></div><Button type="button" size="sm" variant="outline" disabled={levelFreestyleQuestions.length < 5 || Boolean(editingCheck)} onClick={() => setFreestyleQuestions(sampleFreestyleQuestionsByType(levelFreestyleCategories))}><RefreshCw /> Đổi 5 câu</Button></div>{freestyleQuestions.length === 5 ? <div className="grid md:grid-cols-2"><FreestyleQuestionColumn title="YES / NO" questions={groupedFreestyleQuestions.yesNo} /><FreestyleQuestionColumn title="WH QUESTIONS" questions={groupedFreestyleQuestions.wh} className="border-t md:border-l md:border-t-0" /></div> : <p className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Ngân hàng của level {program.label} chưa đủ 5 câu. Hãy bổ sung tại Khung chương trình trước khi kiểm tra.</p>}</div><div><div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Evaluation matrix</p><p className="text-xs text-muted-foreground">Đánh giá riêng Pattern và Free theo từng tiêu chí.</p></div><div className="flex gap-2 text-xs"><Badge variant="outline">Pattern {Math.round(patternPercent)}%</Badge><Badge variant="outline">Free {Math.round(freestylePercent)}%</Badge></div></div><CambridgeEvaluationMatrix patternPronunciation={patternPronunciation} setPatternPronunciation={setPatternPronunciation} freePronunciation={freePronunciation} setFreePronunciation={setFreePronunciation} patternOneOrMany={patternOneOrMany} setPatternOneOrMany={setPatternOneOrMany} freeOneOrMany={freeOneOrMany} setFreeOneOrMany={setFreeOneOrMany} patternAmIsAre={patternAmIsAre} setPatternAmIsAre={setPatternAmIsAre} freeAmIsAre={freeAmIsAre} setFreeAmIsAre={setFreeAmIsAre} /></div></> : null}
      </CardContent></Card></div>
      <Card className="h-fit border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">{editingCheck ? "Cập nhật kết quả" : "Kết quả kiểm tra"}</CardTitle><Badge variant="outline">{previewResult}</Badge></div></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="check-date">Ngày đánh giá</Label><Input id="check-date" type="date" value={checkedAt} onChange={(event) => setCheckedAt(event.target.value)} /></div><div className="space-y-3"><div className="flex items-center justify-between gap-3"><Label>Nhận xét thường gặp</Label>{canManage ? <Button type="button" size="sm" variant="ghost" onClick={openFeedbackOptions}><Settings2 /> Quản lý</Button> : null}</div>{feedbackOptions.filter((item) => item.active).length ? <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border bg-slate-50/70 p-3">{Array.from(new Set(feedbackOptions.filter((item) => item.active).map((item) => item.category))).map((category) => <div key={category}><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{category}</p><div className="space-y-2">{feedbackOptions.filter((item) => item.active && item.category === category).map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-lg bg-white p-2.5 text-sm leading-5 shadow-sm"><Checkbox checked={selectedFeedbackIds.includes(item.id)} onCheckedChange={(checked) => setSelectedFeedbackIds((current) => checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span>{item.label}</span></label>)}</div></div>)}</div> : canManage ? <Button type="button" variant="outline" className="w-full" onClick={openFeedbackOptions}><Settings2 /> Thêm mẫu nhận xét</Button> : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Chưa có mẫu nhận xét đang sử dụng.</p>}</div><div><Label htmlFor="check-notes">Nhận xét / lý do khác</Label><Textarea id="check-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Nhập nội dung khác ngoài các lựa chọn phía trên..." /></div><Button className="w-full bg-[#ff7a3d] hover:bg-[#e9652f]" disabled={!complete || saving} onClick={save}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} {editingCheck ? "Cập nhật kết quả" : "Lưu đánh giá"}</Button></CardContent></Card>
    </div> : null}
    {!student ? <EmptyBox title="Chọn học viên" description="Mở danh sách học viên trong một thẻ lớp và chọn Kiểm tra ngay." /> : null}
  </div>;
}

function CurriculumReference({ unit }: { unit: CurriculumUnit }) {
  return <Card className="overflow-hidden border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><div className={`h-1.5 ${unit.group === "baby" ? "bg-rose-400" : unit.group === "super" ? "bg-amber-400" : "bg-emerald-500"}`} /><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><ProgramBadge group={unit.group}>{unit.programLabel}</ProgramBadge><Badge variant="outline">{unit.series}</Badge></div><CardTitle className="mt-3 text-xl">{unit.unitLabel}: {unit.topic}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{unit.dayStart === unit.dayEnd ? `Buổi ${unit.dayStart}` : `Buổi ${unit.dayStart}–${unit.dayEnd}`} · {unit.content}</p></div>{unit.isOverride ? <Badge variant="secondary"><SlidersHorizontal /> Đã điều chỉnh</Badge> : null}</div></CardHeader><CardContent><CurriculumBlocks unit={unit} /></CardContent></Card>;
}

function ReferenceBlock({ icon, title, content, itemized = false }: { icon: ReactNode; title: string; content: string; itemized?: boolean }) {
  const items = itemized ? content.split(/\s+-\s+|;\s*/).map((item) => item.trim()).filter(Boolean) : [];
  return <div className="rounded-xl border bg-slate-50/80 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0b5c75]"><span className="[&_svg]:size-4">{icon}</span>{title}</div>{items.length ? <div className="flex flex-wrap gap-2">{items.map((item, index) => <span key={`${item}-${index}`} className="rounded-lg border bg-white px-2.5 py-1.5 text-sm leading-5 text-[#345064] shadow-sm">{item}</span>)}</div> : <p className="whitespace-pre-line text-sm leading-6 text-[#345064]">{content}</p>}</div>;
}

function CurriculumBlocks({ unit }: { unit: CurriculumUnit }) {
  const groups = parseVocabularyGroups(unit.vocabulary);
  const vocabularyTotal = groups.reduce((sum, group) => sum + group.content.split(/\s+-\s+/).filter(Boolean).length, 0);
  return <div className="space-y-4">{groups.length ? <div className="overflow-hidden rounded-xl border bg-white"><div className="flex items-center justify-between border-b bg-slate-50/70 px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-[#143b63]"><Languages className="size-4" /> Vocabulary</div><span className="text-xs text-muted-foreground">{vocabularyTotal} từ · {groups.length} nhóm</span></div><div className="grid md:grid-cols-2">{groups.map((group, groupIndex) => { const words = group.content.split(/\s+-\s+/).filter(Boolean); return <div key={group.label} className={`p-4 ${groupIndex > 0 ? "border-t" : ""} ${groupIndex % 2 === 1 ? "md:border-l" : ""} ${groupIndex === 1 ? "md:border-t-0" : ""}`}><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold tracking-[0.12em] text-[#143b63]">{group.label}</p><span className="text-[11px] text-muted-foreground">{words.length}</span></div>{words.length ? <div className="flex flex-wrap gap-1.5">{words.map((item, index) => <span key={`${item}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs leading-5 text-slate-700">{item}</span>)}</div> : <p className="text-xs text-muted-foreground">Chưa có nội dung</p>}</div>; })}</div></div> : unit.vocabulary ? <ReferenceBlock icon={<Languages />} title="Vocabulary" content={unit.vocabulary} itemized /> : null}{unit.grammar ? <ReferenceBlock icon={<MessageCircle />} title={unit.group === "cambridge" ? "Communication" : "Grammar / Communication"} content={unit.grammar} /> : null}{unit.group === "baby" ? <ReferenceBlock icon={<BookOpen />} title="Lesson content" content={unit.content} /> : null}</div>;
}

export function CurriculumManager({ curriculum, freestyleBanks, onReload }: { curriculum: CurriculumUnit[]; freestyleBanks: FreestyleBank[]; onReload: () => Promise<void> | void }) {
  const [programCode, setProgramCode] = useState(programs[0].code);
  const [editing, setEditing] = useState<CurriculumUnit | null>(null);
  const [editingFreestyleBank, setEditingFreestyleBank] = useState(false);
  const [resetting, setResetting] = useState<CurriculumUnit | null>(null);
  const selectedProgram = programs.find((program) => program.code === programCode)!;
  const rows = curriculum.filter((unit) => unit.programCode === programCode);
  const speakingProgramCode = selectedProgram.group === "cambridge" ? selectedProgram.code as SpeakingProgramCode : null;
  const selectedFreestyleBank = speakingProgramCode
    ? freestyleBanks.find((bank) => bank.programCode === speakingProgramCode) ?? { programCode: speakingProgramCode, programLabel: selectedProgram.label, categories: defaultFreestyleBanks[speakingProgramCode] }
    : null;

  const reset = async () => {
    if (!resetting) return;
    try { await send("resetCurriculumUnit", { programCode: resetting.programCode, unitNumber: resetting.unitNumber }); await onReload(); toast.success("Đã khôi phục nội dung gốc từ tài liệu."); setResetting(null); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể khôi phục."); }
  };

  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#d95c25]">Curriculum Library</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nội dung khung đánh giá</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Vocabulary và Grammar / Communication được quản lý theo từng Unit. Riêng Freestyle được quản lý một ngân hàng chung cho toàn bộ level Starters, Movers hoặc Flyers.</p></div><div className="w-full sm:w-72"><Label className="mb-2">Chương trình</Label><Picker value={programCode} onChange={(value) => { setProgramCode(value); setEditingFreestyleBank(false); }} placeholder="Chọn chương trình" options={programs.map((program) => ({ value: program.code, label: curriculum.find((unit) => unit.programCode === program.code)?.programLabel || program.label }))} /></div></div>
    <div className={`rounded-2xl border p-5 ${selectedProgram.group === "baby" ? "border-rose-200 bg-rose-50" : selectedProgram.group === "super" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-bold">{rows[0]?.programLabel || selectedProgram.label}</p><p className="text-sm text-muted-foreground">{selectedProgram.series} · {selectedProgram.lessons} buổi</p></div><ProgramBadge group={selectedProgram.group}>{rows.length} nội dung kiểm tra</ProgramBadge></div></div>
    {selectedFreestyleBank ? <LevelFreestyleBank bank={selectedFreestyleBank} onEdit={() => setEditingFreestyleBank(true)} /> : null}
    <div className="space-y-4">{rows.map((unit) => <Card key={curriculumKey(unit.programCode, unit.unitNumber)} className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="gap-3 border-b sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{unit.unitLabel}</Badge><span className="text-xs text-muted-foreground">{unit.dayStart === unit.dayEnd ? `Buổi ${unit.dayStart}` : `Buổi ${unit.dayStart}–${unit.dayEnd}`}</span></div><CardTitle className="mt-2 text-lg">{unit.topic}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{unit.content}</p></div><div className="flex shrink-0 items-center gap-2"><Badge variant="outline">{unit.group === "baby" ? "Spelling · Writing" : unit.group === "super" ? `Vocab /${unit.vocabularyMax} · Giao tiếp` : "Pattern · Freestyle"}</Badge><Button size="icon-sm" variant="ghost" onClick={() => setEditing(unit)} aria-label={`Sửa ${unit.unitLabel}`}><Pencil /></Button>{unit.isOverride ? <Button size="icon-sm" variant="ghost" onClick={() => setResetting(unit)} aria-label={`Khôi phục ${unit.unitLabel}`}><RotateCcw /></Button> : null}</div></CardHeader><CardContent className="pt-5"><CurriculumBlocks unit={unit} /></CardContent></Card>)}</div>
    {editing ? <CurriculumEditor key={curriculumKey(editing.programCode, editing.unitNumber)} unit={editing} onClose={() => setEditing(null)} onSaved={async () => { await onReload(); setEditing(null); }} /> : null}
    {editingFreestyleBank && selectedFreestyleBank ? <FreestyleBankEditor key={selectedFreestyleBank.programCode} bank={selectedFreestyleBank} onClose={() => setEditingFreestyleBank(false)} onSaved={async () => { await onReload(); setEditingFreestyleBank(false); }} /> : null}
    <AlertDialog open={Boolean(resetting)} onOpenChange={(open) => { if (!open) setResetting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Khôi phục nội dung gốc?</AlertDialogTitle><AlertDialogDescription>Mọi điều chỉnh tại {resetting?.unitLabel} sẽ được thay bằng nội dung lấy từ file chương trình ban đầu. Ngân hàng Freestyle chung của level không bị thay đổi.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={reset}>Khôi phục</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function LevelFreestyleBank({ bank, onEdit }: { bank: FreestyleBank; onEdit: () => void }) {
  const total = flattenFreestyleCategories(bank.categories).length;
  return <Card className="overflow-hidden border-emerald-200 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="border-b bg-emerald-50/80"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">Freestyle · ngân hàng chung level {bank.programLabel}</CardTitle><p className="mt-1 text-sm text-muted-foreground">Áp dụng cho tất cả Unit của level này · {bank.categories.length} nhóm · {total} câu</p></div><Button type="button" variant="outline" onClick={onEdit}><Pencil /> Chỉnh sửa ngân hàng</Button></div></CardHeader><CardContent className="pt-5">{bank.categories.length ? <div className="grid gap-4 lg:grid-cols-2">{bank.categories.map((category, index) => <div key={`${category.category}-${index}`} className="rounded-xl border bg-slate-50/70 p-4"><p className="font-bold text-[#0b5c75]">{category.category}</p><div className="mt-3 grid gap-4 sm:grid-cols-2"><QuestionColumn title="YES / NO" questions={category.yesNoQuestions} /><QuestionColumn title="WH QUESTIONS" questions={category.whQuestions} /></div></div>)}</div> : <EmptyBox title={`Chưa có câu Freestyle cho ${bank.programLabel}`} description="Bạn có thể tạo nhóm chủ đề và nhập câu hỏi trực tiếp. Cần ít nhất 5 câu để bắt đầu một lượt kiểm tra mới." action={<Button type="button" onClick={onEdit}><Plus /> Thêm nội dung</Button>} />}</CardContent></Card>;
}

function QuestionColumn({ title, questions }: { title: string; questions: string[] }) {
  return <div><p className="text-xs font-bold tracking-wide text-muted-foreground">{title}</p>{questions.length ? <ul className="mt-2 space-y-1.5 text-sm leading-5">{questions.map((question, index) => <li key={`${question}-${index}`}>• {question}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Chưa có câu hỏi</p>}</div>;
}

function questionsFromText(value: string) {
  return Array.from(new Set(value.split(/\r?\n/).map((question) => question.trim()).filter(Boolean)));
}

function FreestyleBankEditor({ bank, onClose, onSaved }: { bank: FreestyleBank; onClose: () => void; onSaved: () => Promise<void> | void }) {
  type EditableCategory = { id: string; category: string; yesNoText: string; whText: string };
  const [categories, setCategories] = useState<EditableCategory[]>(bank.categories.map((category, index) => ({ id: `saved-${index}`, category: category.category, yesNoText: category.yesNoQuestions.join("\n"), whText: category.whQuestions.join("\n") })));
  const [saving, setSaving] = useState(false);
  const normalizedCategories: FreestyleQuestionCategory[] = categories.map((category) => ({ category: category.category.trim(), yesNoQuestions: questionsFromText(category.yesNoText), whQuestions: questionsFromText(category.whText) }));
  const total = flattenFreestyleCategories(normalizedCategories).length;
  const updateCategory = (id: string, changes: Partial<EditableCategory>) => setCategories((current) => current.map((category) => category.id === id ? { ...category, ...changes } : category));
  const save = async () => {
    if (normalizedCategories.some((category) => !category.category && (category.yesNoQuestions.length || category.whQuestions.length))) {
      toast.error("Vui lòng nhập tên cho mọi nhóm đang có câu hỏi.");
      return;
    }
    setSaving(true);
    try {
      await send("updateFreestyleBank", { programCode: bank.programCode, categories: normalizedCategories });
      await onSaved();
      toast.success(`Đã lưu ngân hàng Freestyle của ${bank.programLabel}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu ngân hàng Freestyle.");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>Freestyle chung · {bank.programLabel}</DialogTitle><DialogDescription>Các câu hỏi tại đây áp dụng cho toàn bộ level, không phụ thuộc Unit. Nhập mỗi câu trên một dòng; có thể lưu trống và bổ sung sau.</DialogDescription></DialogHeader><div className="space-y-4 py-2">{categories.map((category, index) => <div key={category.id} className="space-y-3 rounded-xl border bg-slate-50/70 p-4"><div className="flex items-end gap-2"><div className="flex-1"><Label htmlFor={`category-${category.id}`}>Tên nhóm chủ đề</Label><Input id={`category-${category.id}`} value={category.category} maxLength={100} onChange={(event) => updateCategory(category.id, { category: event.target.value })} placeholder="Ví dụ: Personal information" /></div><Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => setCategories((current) => current.filter((item) => item.id !== category.id))} aria-label={`Xóa nhóm ${index + 1}`}><Trash2 /></Button></div><div className="grid gap-3 md:grid-cols-2"><Field label={`YES / NO · ${questionsFromText(category.yesNoText).length} câu`}><Textarea rows={8} value={category.yesNoText} onChange={(event) => updateCategory(category.id, { yesNoText: event.target.value })} placeholder="Mỗi câu trên một dòng..." /></Field><Field label={`WH QUESTIONS · ${questionsFromText(category.whText).length} câu`}><Textarea rows={8} value={category.whText} onChange={(event) => updateCategory(category.id, { whText: event.target.value })} placeholder="Mỗi câu trên một dòng..." /></Field></div></div>)}<Button type="button" variant="outline" onClick={() => setCategories((current) => [...current, { id: `new-${Date.now()}-${current.length}`, category: "", yesNoText: "", whText: "" }])}><Plus /> Thêm nhóm chủ đề</Button><div className={`rounded-lg border p-3 text-sm ${total >= 5 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>Hiện có {total} câu. {total >= 5 ? "Đã đủ để hệ thống chọn ngẫu nhiên 5 câu cho mỗi lượt kiểm tra." : "Cần ít nhất 5 câu để bắt đầu lượt kiểm tra mới."}</div></div><DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={save} disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu ngân hàng</Button></DialogFooter></DialogContent></Dialog>;
}

function CurriculumEditor({ unit, onClose, onSaved }: { unit: CurriculumUnit; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const sourceVocabulary = curriculumDefaults.find((item) => item.programCode === unit.programCode && item.unitNumber === unit.unitNumber)?.vocabulary;
  const [topic, setTopic] = useState(unit.topic);
  const [content, setContent] = useState(unit.content);
  const [vocabulary, setVocabulary] = useState(unit.vocabulary);
  const [grammar, setGrammar] = useState(unit.grammar);
  const [vocabularyMax, setVocabularyMax] = useState(String(unit.vocabularyMax));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await send("updateCurriculumUnit", { programCode: unit.programCode, unitNumber: unit.unitNumber, topic, content, vocabulary, grammar, vocabularyMax: Number(vocabularyMax), writingRef: "" });
      await onSaved();
      toast.success("Đã cập nhật khung chương trình.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu.");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa {unit.programLabel} · {unit.unitLabel}</DialogTitle><DialogDescription>Nội dung chỉnh sửa sẽ thay thế bản gốc khi giáo viên mở phiếu đánh giá. Ngân hàng Freestyle chung được chỉnh riêng ở đầu trang level.</DialogDescription></DialogHeader><div className="grid gap-4 py-2">
    <Field label="Chủ đề"><Input value={topic} onChange={(event) => setTopic(event.target.value)} /></Field>
    <Field label="Nội dung"><Input value={content} onChange={(event) => setContent(event.target.value)} /></Field>
    <Field label="Vocabulary">{unit.programCode === "FLYERS" && sourceVocabulary && vocabulary !== sourceVocabulary ? <div className="space-y-2 rounded-lg bg-emerald-50 p-3"><p className="text-xs text-emerald-800">Nạp 5 nhóm từ loại từ PDF Flyers mới. Các trường khác giữ nguyên; chỉ cập nhật khi bấm Lưu nội dung.</p><Button type="button" size="sm" variant="outline" onClick={() => setVocabulary(sourceVocabulary)}><RefreshCw /> Nạp vocab Flyers mới</Button></div> : null}<Textarea value={vocabulary} onChange={(event) => setVocabulary(event.target.value)} rows={10} /></Field>
    <Field label={unit.group === "cambridge" ? "Communication guidance" : "Grammar / Communication"}><Textarea value={grammar} onChange={(event) => setGrammar(event.target.value)} rows={5} /></Field>
    <Field label="Tổng số từ vựng"><Input type="number" min={0} value={vocabularyMax} onChange={(event) => setVocabularyMax(event.target.value)} /></Field>
  </div><DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={save} disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu nội dung</Button></DialogFooter></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
