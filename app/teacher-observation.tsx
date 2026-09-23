"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyObservation, observationGroups, readObservation, validateObservationItems, type TeacherObservation } from "@/lib/observation";
import { vietnamToday } from "@/lib/weekly-history";

type NamedRow = { id: number; name: string };
type Props = { teachers: NamedRow[]; classes: NamedRow[]; observations: TeacherObservation[]; onSaved: () => Promise<void> | void };
const selectStyle = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
const dateLabel = (value: string) => value.split("-").reverse().join("/");

async function send(payload: Record<string, unknown>) {
  const response = await fetch("/api/observations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || "Không thể lưu Observation.");
}

export function TeacherObservationView({ selectedTeacherId, ...props }: Props & { selectedTeacherId: string }) {
  const [generation, setGeneration] = useState(0);
  return <div className="space-y-7">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#2f6f9f]">Academic Observation</p><h1 className="mt-1 text-3xl font-bold">Dự giờ & đánh giá giáo viên</h1><p className="mt-2 text-sm text-muted-foreground">Class Observation Form · Ghi nhận Academic và Attitude theo từng buổi dự giờ.</p></div>
    <ObservationForm key={`${generation}-${selectedTeacherId}`} teachers={props.teachers} classes={props.classes} initialTeacherId={selectedTeacherId} onSaved={async () => { await props.onSaved(); setGeneration((value) => value + 1); }} />
    <ObservationHistory {...props} />
  </div>;
}

function ObservationForm({ teachers, classes, initialTeacherId = "", existing, onSaved, onCancel }: Omit<Props, "observations"> & { initialTeacherId?: string; existing?: TeacherObservation; onCancel?: () => void }) {
  const [teacherId, setTeacherId] = useState(existing ? String(existing.teacherId ?? "archived") : initialTeacherId);
  const [classId, setClassId] = useState(existing ? String(existing.classId ?? "archived") : "");
  const [teacherRole, setTeacherRole] = useState(existing?.teacherRole || "teacher");
  const [observedAt, setObservedAt] = useState(existing?.observedAt || vietnamToday());
  const [observedTime, setObservedTime] = useState(existing?.observedTime || "");
  const [items, setItems] = useState(() => existing ? readObservation(existing.itemsJson) : emptyObservation());
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      validateObservationItems(items);
      setSaving(true);
      await send({ action: existing ? "update" : "create", id: existing?.id, teacherId: teacherId === "archived" ? null : Number(teacherId), classId: classId === "archived" ? null : Number(classId), teacherRole, observedAt, observedTime, items });
      await onSaved();
      toast.success(existing ? "Đã cập nhật phiếu Observation." : "Đã lưu phiếu Observation.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu."); }
    finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="space-y-5">
    <Card className="border-0"><CardHeader><CardTitle>CLASS OBSERVATION FORM</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="space-y-2 text-sm font-medium">Date · Ngày<Input required type="date" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium">Time · Giờ<Input required type="time" value={observedTime} onChange={(event) => setObservedTime(event.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium">Class · Lớp<select required className={selectStyle} value={classId} onChange={(event) => setClassId(event.target.value)}><option value="">Chọn lớp</option>{existing?.classId === null && <option value="archived">{existing.className} (đã lưu)</option>}{classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Teacher / TA<select required className={selectStyle} value={teacherId} onChange={(event) => setTeacherId(event.target.value)}><option value="">Chọn người được dự giờ</option>{existing?.teacherId === null && <option value="archived">{existing.teacherName} (đã lưu)</option>}{teachers.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Vai trò<select className={selectStyle} value={teacherRole} onChange={(event) => setTeacherRole(event.target.value)}><option value="teacher">Teacher · Giáo viên</option><option value="ta">TA · Trợ giảng</option></select></label>
    </CardContent></Card>
    <p className="text-sm text-muted-foreground">Đánh dấu các tiêu chí cần ghi nhận và nhập Note. Ô chưa chọn không được tự quy đổi thành đạt hoặc chưa đạt.</p>
    <div className="grid items-start gap-5 xl:grid-cols-2">{observationGroups.map((group) => <Card key={group.label} className="border-0"><CardHeader className="rounded-t-xl bg-[#e9f5f4]"><CardTitle>{group.label}</CardTitle></CardHeader><CardContent className="space-y-4 pt-5">{group.criteria.map(({ key, label }) => <div key={key} className="space-y-2 rounded-xl border p-4">
      <label className="flex items-center gap-3 font-medium"><input type="checkbox" className="size-4 accent-[#0b6476]" checked={items[key].checked} onChange={(event) => setItems((current) => ({ ...current, [key]: { ...current[key], checked: event.target.checked } }))} />{label}</label>
      <Textarea aria-label={`Note · ${label}`} placeholder="Note · Ghi chú quan sát..." maxLength={4000} rows={3} value={items[key].note} onChange={(event) => setItems((current) => ({ ...current, [key]: { ...current[key], note: event.target.value } }))} />
    </div>)}</CardContent></Card>)}</div>
    <div className="flex flex-wrap items-center justify-end gap-3">{existing && <p className="mr-auto text-xs text-muted-foreground">Người ghi nhận: {existing.observerName}</p>}{onCancel && <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Hủy</Button>}<Button type="submit" disabled={saving || !teachers.length && !existing}>{saving ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />} {existing ? "Lưu thay đổi" : "Lưu Observation"}</Button></div>
    {!teachers.length && !existing && <p className="text-sm text-muted-foreground">Thêm giáo viên hoặc trợ giảng trong mục Giáo viên trước khi tạo phiếu.</p>}
  </form>;
}

export function ObservationHistory({ teachers, classes, observations, onSaved }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeacherObservation | null>(null);
  const [deleting, setDeleting] = useState<TeacherObservation | null>(null);
  const [busy, setBusy] = useState(false);
  const filtered = observations.filter((row) => `${row.teacherName} ${row.className} ${row.observedAt} ${dateLabel(row.observedAt)}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try { await send({ action: "delete", id: deleting.id }); await onSaved(); setDeleting(null); toast.success("Đã xóa phiếu Observation."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Không thể xóa."); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Lịch sử Observation</h2><p className="text-sm text-muted-foreground">{observations.length} phiếu đã lưu · Có thể mở xem và cập nhật.</p></div><Input aria-label="Tìm Observation" className="sm:max-w-xs" placeholder="Tên giáo viên, lớp hoặc ngày..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    {!filtered.length && <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">Chưa có phiếu Observation phù hợp.</div>}
    {filtered.map((row) => { const items = readObservation(row.itemsJson); return <details key={row.id} className="rounded-xl border bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium">{row.teacherName} · {row.teacherRole === "ta" ? "TA" : "Teacher"} · {row.className} · {dateLabel(row.observedAt)} {row.observedTime}</summary>
      <p className="mt-3 text-xs text-muted-foreground">Người ghi nhận: {row.observerName}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{observationGroups.map((group) => <div key={group.label} className="space-y-2"><h3 className="font-bold text-[#0b6476]">{group.label}</h3>{group.criteria.map(({ key, label }) => <div key={key} className="rounded-lg bg-slate-50 p-3 text-sm"><p className="font-semibold">{label} <span className="font-normal text-muted-foreground">· {items[key].checked ? "Đã đánh dấu" : "Chưa đánh dấu"}</span></p><p className="mt-1 whitespace-pre-wrap break-words">{items[key].note || "Chưa có ghi chú."}</p></div>)}</div>)}</div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(row)}><Pencil /> Cập nhật</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(row)}><Trash2 /> Xóa</Button></div>
    </details>; })}
    <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl"><DialogHeader><DialogTitle>Cập nhật Observation</DialogTitle><DialogDescription>Chỉnh sửa phiếu dự giờ đã lưu.</DialogDescription></DialogHeader>{editing && <ObservationForm key={editing.id} teachers={teachers} classes={classes} existing={editing} onSaved={async () => { await onSaved(); setEditing(null); }} onCancel={() => setEditing(null)} />}</DialogContent></Dialog>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa phiếu Observation?</AlertDialogTitle><AlertDialogDescription>Phiếu của {deleting?.teacherName} ngày {deleting ? dateLabel(deleting.observedAt) : ""} sẽ bị xóa. Thao tác này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); void remove(); }}>Xóa phiếu</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
