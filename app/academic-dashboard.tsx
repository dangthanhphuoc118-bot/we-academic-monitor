"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  ListChecks,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  Users,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { CurriculumManager, CurriculumStudentCheck, type FeedbackOption, type LevelOption } from "./curriculum-check";
import { programs, type CurriculumUnit, type LearningCheck, type StudentCheckQueueItem } from "@/lib/curriculum";
import { AccountManager, LoginScreen, roleLabels, type CurrentUser } from "./auth-components";

type View = "overview" | "student-check" | "students" | "classes" | "teachers" | "teacher-review" | "curriculum" | "feedback-options" | "criteria" | "reports" | "accounts";
type EntityKind = "class" | "student" | "teacher" | "criterion" | "levelOption" | "feedbackOption";
type DataRow = Record<string, string | number | null>;

type ClassRow = { id: number; name: string; level: string; schedule: string; room: string; teacherId: number | null; teacherName: string | null; status: string; studentCount: number };
type StudentRow = { id: number; name: string; classId: number | null; className: string | null; level: string; guardianPhone: string; status: string; note: string };
type TeacherRow = { id: number; name: string; email: string; phone: string; specialization: string; status: string; note: string; classCount: number };
type CriterionRow = { id: number; targetType: "student" | "teacher"; level: string; category: string; title: string; description: string; weight: number; active: number; sortOrder: number };
type StudentAssessment = { id: number; studentId: number; studentName: string; classId: number | null; className: string | null; evaluatorName: string; overallScore: number; result: string; summary: string; actionPlan: string; checkedAt: string };
type TeacherReview = { id: number; teacherId: number; teacherName: string; reviewerName: string; overallScore: number; result: string; summary: string; actionPlan: string; observedAt: string };
type StudentProgressRecord = { id: number; studentId: number; studentName: string; classId: number | null; className: string | null; overallScore: number; result: string; checkedAt: string; source: "legacy" | "curriculum"; programLabel?: string; unitLabel?: string; teacherName?: string; reason: string };
type AcademicData = { classes: ClassRow[]; students: StudentRow[]; teachers: TeacherRow[]; criteria: CriterionRow[]; studentAssessments: StudentAssessment[]; teacherReviews: TeacherReview[]; curriculum: CurriculumUnit[]; learningChecks: LearningCheck[]; levelOptions: LevelOption[]; feedbackOptions: FeedbackOption[]; checkQueue: StudentCheckQueueItem[] };

const emptyData: AcademicData = { classes: [], students: [], teachers: [], criteria: [], studentAssessments: [], teacherReviews: [], curriculum: [], learningChecks: [], levelOptions: [], feedbackOptions: [], checkQueue: [] };
const today = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};

const navItems: { id: View; label: string; icon: typeof LayoutDashboard; section: "main" | "manage" | "report" }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard, section: "main" },
  { id: "student-check", label: "Kiểm tra học viên", icon: ClipboardCheck, section: "main" },
  { id: "teacher-review", label: "Đánh giá giáo viên", icon: UserCheck, section: "main" },
  { id: "students", label: "Học viên", icon: GraduationCap, section: "manage" },
  { id: "classes", label: "Lớp học", icon: Building2, section: "manage" },
  { id: "teachers", label: "Giáo viên", icon: Users, section: "manage" },
  { id: "curriculum", label: "Khung chương trình", icon: BookOpen, section: "manage" },
  { id: "feedback-options", label: "Mẫu nhận xét", icon: ListChecks, section: "manage" },
  { id: "criteria", label: "Tiêu chí giáo viên", icon: Settings2, section: "manage" },
  { id: "accounts", label: "Tài khoản", icon: UserCog, section: "manage" },
  { id: "reports", label: "Báo cáo", icon: BarChart3, section: "report" },
];

function defaultView(user: CurrentUser): View {
  if (user.role === "academic_leader" || user.role === "academic_manager") return "overview";
  return "overview";
}

function navFor(user: CurrentUser) {
  if (user.role === "admin") return navItems;
  return navItems.filter((item) => item.id !== "accounts");
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function resultClass(result: string) {
  if (result === "Good" || result === "Tốt") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (result === "Average" || result === "Đạt") return "border-amber-200 bg-amber-50 text-amber-800";
  if (result === "Redflag" || result.startsWith("Cần")) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function reportBucket(result: string): "good" | "average" | "redflag" {
  if (result === "Good" || result === "Tốt") return "good";
  if (result === "Average" || result === "Đạt") return "average";
  return "redflag";
}

function StatusBadge({ value }: { value: string }) {
  const label: Record<string, string> = { active: "Đang hoạt động", paused: "Tạm dừng", leave: "Nghỉ phép", completed: "Đã kết thúc" };
  return <Badge variant="outline" className={value === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{label[value] ?? value}</Badge>;
}

function ResultBadge({ value }: { value: string }) {
  return <Badge variant="outline" className={resultClass(value)}>{value}</Badge>;
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#d95c25]">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#102233] sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = "teal" }: { label: string; value: string | number; note: string; icon: typeof Users; tone?: "teal" | "orange" | "navy" | "gold" }) {
  const tones = { teal: "bg-[#e1f4f6] text-[#0b6476]", orange: "bg-[#fff0e7] text-[#d95c25]", navy: "bg-[#e7edf2] text-[#16364e]", gold: "bg-[#fff6d9] text-[#946b00]" };
  return (
    <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]">
      <CardContent className="flex items-start justify-between p-5">
        <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="size-5" /></div>
      </CardContent>
    </Card>
  );
}

function EmptyPanel({ icon: Icon, title, description, action }: { icon: typeof Users; title: string; description: string; action?: ReactNode }) {
  return (
    <Empty className="min-h-64 border border-dashed bg-white/60">
      <EmptyHeader><EmptyMedia variant="icon"><Icon /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

async function postAction(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/academic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || "Không thể lưu dữ liệu.");
  return result;
}

export function AcademicDashboard() {
  const [view, setView] = useState<View>("overview");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [data, setData] = useState<AcademicData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<{ kind: EntityKind; item?: DataRow } | null>(null);
  const [deleting, setDeleting] = useState<{ action: string; id: number; name: string } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const reload = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch("/api/academic", { cache: "no-store" });
      const result = await response.json() as AcademicData & { error?: string };
      if (response.status === 401) {
        setUser(null);
        setData(emptyData);
      }
      if (!response.ok) throw new Error(result.error || "Không thể tải dữ liệu.");
      setData(result);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Loading the session and remote dashboard data after mount is the intended synchronization here.
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth", { cache: "no-store" });
        const result = await response.json() as { user?: CurrentUser | null; setupRequired?: boolean };
        if (result.user) {
          setUser(result.user);
          setView(defaultView(result.user));
          await reload();
        } else {
          setSetupRequired(Boolean(result.setupRequired));
          setLoading(false);
        }
      } catch {
        setSetupRequired(true);
        setLoading(false);
      } finally {
        setAuthLoading(false);
      }
    };
    void loadSession();
  }, []);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool || !user) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await modelContext.registerTool({
        name: "list_students_needing_support",
        title: "Danh sách học viên cần hỗ trợ",
        description: "Trả về các học viên có kết quả gần nhất là Cần theo dõi hoặc Cần hỗ trợ.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: async () => ({ students: latestStudentRows(data).filter((row) => row.latest && reportBucket(row.latest.result) === "redflag").map((row) => ({ id: row.student.id, name: row.student.name, className: row.student.className, result: row.latest?.result, score: row.latest?.overallScore })) }),
      }, { signal: lifecycle.signal });
      await modelContext.registerTool({
        name: "start_student_evaluation",
        title: "Mở phiếu đánh giá học viên",
        description: "Mở đúng lớp và học viên trên màn hình đánh giá; chưa lưu kết quả.",
        inputSchema: { type: "object", properties: { studentId: { type: "integer", description: "Mã học viên" } }, required: ["studentId"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input: unknown) => {
          const studentId = Number((input as { studentId?: number })?.studentId);
          const student = data.students.find((item) => item.id === studentId);
          if (!student) throw new Error("Không tìm thấy học viên.");
          setSelectedClassId(student.classId ? String(student.classId) : "");
          setSelectedStudentId(String(student.id));
          setView("student-check");
          return { opened: true, studentId: student.id, studentName: student.name };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [data, user]);

  const latestStudents = useMemo(() => latestStudentRows(data), [data]);
  const currentMonth = today().slice(0, 7);
  const checkedThisMonth = studentProgressRecords(data).filter((item) => item.checkedAt.startsWith(currentMonth)).length;
  const studentsAtRisk = latestStudents.filter((row) => row.latest && reportBucket(row.latest.result) === "redflag");
  const unassessed = latestStudents.filter((row) => !row.latest).length;
  const latestTeacherMap = new Map<number, TeacherReview>();
  data.teacherReviews.forEach((review) => { if (!latestTeacherMap.has(review.teacherId)) latestTeacherMap.set(review.teacherId, review); });

  const saveEntity = async (action: string, payload: Record<string, unknown>) => {
    const loadingToast = toast.loading("Đang lưu thay đổi...");
    try {
      await postAction(action, payload);
      await reload(true);
      setEditor(null);
      toast.success("Đã lưu dữ liệu.", { id: loadingToast });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu.", { id: loadingToast }); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await postAction(deleting.action, { id: deleting.id });
      await reload(true);
      toast.success("Đã xóa dữ liệu.");
      setDeleting(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể xóa."); }
  };

  const goToStudentCheck = (student: StudentRow) => {
    setSelectedClassId(student.classId ? String(student.classId) : "");
    setSelectedStudentId(String(student.id));
    setView("student-check");
  };

  const authenticated = (nextUser: CurrentUser) => {
    setUser(nextUser);
    setSetupRequired(false);
    setView(defaultView(nextUser));
    void reload();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setUser(null);
      setData(emptyData);
      setLoading(false);
    }
  };

  if (authLoading) {
    return <main className="academic-grid grid min-h-screen place-items-center bg-[#f3f6f8]"><div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><LoaderCircle className="animate-spin" /> Đang kiểm tra đăng nhập...</div></main>;
  }

  if (!user) {
    return <><LoginScreen setupRequired={setupRequired} onAuthenticated={authenticated} /><Toaster richColors position="top-right" /></>;
  }

  const visibleNavItems = navFor(user);

  const content = loading ? <LoadingView /> : loadError ? <LoadError message={loadError} retry={() => void reload()} /> : (
    <>
      {view === "overview" && <OverviewView data={data} atRisk={studentsAtRisk} unassessed={unassessed} checkedThisMonth={checkedThisMonth} latestTeacherMap={latestTeacherMap} setView={setView} onStudentCheck={goToStudentCheck} />}
      {view === "student-check" && <CurriculumStudentCheck classes={data.classes} students={data.students} curriculum={data.curriculum} levelOptions={data.levelOptions} feedbackOptions={data.feedbackOptions} checkQueue={data.checkQueue} selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} onSaved={() => reload(true)} openCurriculum={() => setView("curriculum")} openFeedbackOptions={() => setView("feedback-options")} canManage />}
      {view === "students" && <StudentsView data={data} onAdd={() => setEditor({ kind: "student" })} onEdit={(item) => setEditor({ kind: "student", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteStudent", id: item.id, name: item.name })} onCheck={goToStudentCheck} />}
      {view === "classes" && <ClassesView data={data} onAdd={() => setEditor({ kind: "class" })} onEdit={(item) => setEditor({ kind: "class", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteClass", id: item.id, name: item.name })} onSchedule={async (classId, studentIds, scheduledDate) => { const loadingToast = toast.loading("Đang tạo danh sách kiểm tra..."); try { await postAction("scheduleStudentChecks", { classId, studentIds, scheduledDate }); await reload(true); setSelectedClassId(String(classId)); setSelectedStudentId(studentIds[0] ? String(studentIds[0]) : ""); setView("student-check"); toast.success(`Đã xếp ${studentIds.length} học viên vào danh sách kiểm tra.`, { id: loadingToast }); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể tạo danh sách kiểm tra.", { id: loadingToast }); } }} />}
      {view === "teachers" && <TeachersView data={data} latestTeacherMap={latestTeacherMap} onAdd={() => setEditor({ kind: "teacher" })} onEdit={(item) => setEditor({ kind: "teacher", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteTeacher", id: item.id, name: item.name })} onReview={(item) => { setSelectedTeacherId(String(item.id)); setView("teacher-review"); }} />}
      {view === "teacher-review" && <TeacherReviewView key={selectedTeacherId} data={data} selectedTeacherId={selectedTeacherId} setSelectedTeacherId={setSelectedTeacherId} onSaved={() => reload(true)} setView={setView} />}
      {view === "curriculum" && <div className="space-y-10"><LevelOptionsView data={data} onAdd={() => setEditor({ kind: "levelOption" })} onEdit={(item) => setEditor({ kind: "levelOption", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteLevelOption", id: item.id, name: item.label })} /><Separator /><CurriculumManager curriculum={data.curriculum} onReload={() => reload(true)} /></div>}
      {view === "feedback-options" && <FeedbackOptionsView data={data} onAdd={() => setEditor({ kind: "feedbackOption" })} onEdit={(item) => setEditor({ kind: "feedbackOption", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteFeedbackOption", id: item.id, name: item.label })} />}
      {view === "criteria" && <CriteriaView data={data} onAdd={() => setEditor({ kind: "criterion" })} onEdit={(item) => setEditor({ kind: "criterion", item: item as unknown as DataRow })} onDelete={(item) => setDeleting({ action: "deleteCriterion", id: item.id, name: item.title })} onSeed={async () => { try { await postAction("seedDefaultCriteria"); await reload(true); toast.success("Đã tạo bộ tiêu chí gợi ý."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể tạo bộ tiêu chí."); } }} />}
      {view === "reports" && <ReportsView data={data} onDeleteAssessment={(item) => setDeleting({ action: "deleteStudentAssessment", id: item.id, name: `đánh giá của ${item.studentName}` })} onDeleteLearningCheck={(item) => setDeleting({ action: "deleteLearningCheck", id: item.id, name: `đánh giá của ${item.studentName}` })} onDeleteReview={(item) => setDeleting({ action: "deleteTeacherReview", id: item.id, name: `đánh giá của ${item.teacherName}` })} />}
      {view === "accounts" && user.role === "admin" && <AccountManager />}
    </>
  );

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r-0">
        <SidebarHeader className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#ff7a3d] text-white shadow-lg shadow-orange-950/20"><BookOpenCheck className="size-5" /></div>
            <div><p className="text-sm font-bold tracking-wide text-white">WE ACADEMIC</p><p className="text-xs text-slate-400">Learning Monitor</p></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <NavGroup label="Điều hành" items={visibleNavItems.filter((item) => item.section === "main")} current={view} onSelect={setView} />
          <NavGroup label="Quản lý dữ liệu" items={visibleNavItems.filter((item) => item.section === "manage")} current={view} onSelect={setView} />
          <NavGroup label="Tổng hợp" items={visibleNavItems.filter((item) => item.section === "report")} current={view} onSelect={setView} />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="truncate text-xs font-semibold text-white">{user.name}</p><p className="mt-1 truncate text-[11px] text-slate-400">{user.email}</p><p className="mt-1 text-xs font-semibold text-[#6fd4df]">{roleLabels[user.role]}</p></div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="academic-grid min-w-0 bg-[#f3f6f8]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center"><SidebarTrigger className="md:hidden" /></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => void reload()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới</Button><Button variant="ghost" size="sm" onClick={() => void logout()}><LogOut /> Đăng xuất</Button></div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-7 lg:p-9">{content}</main>
      </SidebarInset>
      {editor ? <EntityDialog key={`${editor.kind}-${editor.item?.id ?? "new"}`} config={editor} data={data} onClose={() => setEditor(null)} onSave={saveEntity} /> : null}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa {deleting?.name}? Thao tác này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Xóa</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}

function NavGroup({ label, items, current, onSelect }: { label: string; items: typeof navItems; current: View; onSelect: (view: View) => void }) {
  return <SidebarGroup><SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{items.map((item) => <SidebarMenuItem key={item.id}><SidebarMenuButton isActive={current === item.id} onClick={() => onSelect(item.id)} className="h-10 rounded-lg px-3"><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>;
}

function LoadingView() {
  return <div className="space-y-7"><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-9 w-64" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}</div><Skeleton className="h-96 rounded-2xl" /></div>;
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return <EmptyPanel icon={AlertTriangle} title="Chưa tải được dữ liệu" description={message} action={<Button onClick={retry}><RefreshCw /> Thử lại</Button>} />;
}

function studentProgressRecords(data: AcademicData): StudentProgressRecord[] {
  const feedbackText = (value: string) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
    } catch {
      return [];
    }
  };
  return [
    ...data.studentAssessments.map((item) => ({ id: item.id, studentId: item.studentId, studentName: item.studentName, classId: item.classId, className: item.className, overallScore: item.overallScore, result: item.result, checkedAt: item.checkedAt, source: "legacy" as const, teacherName: item.evaluatorName, reason: [item.summary, item.actionPlan].filter(Boolean).join(" · ") })),
    ...data.learningChecks.map((item) => ({ id: item.id, studentId: item.studentId, studentName: item.studentName, classId: item.classId, className: item.className, overallScore: item.overallScore, result: item.result, checkedAt: item.checkedAt, source: "curriculum" as const, programLabel: item.programLabel, unitLabel: item.unitLabel, teacherName: item.teacherName, reason: [...feedbackText(item.feedbackJson), item.notes].filter(Boolean).join(" · ") })),
  ].sort((left, right) => right.checkedAt.localeCompare(left.checkedAt) || right.id - left.id);
}

function latestStudentRows(data: AcademicData) {
  const latestMap = new Map<number, StudentProgressRecord>();
  studentProgressRecords(data).forEach((assessment) => { if (!latestMap.has(assessment.studentId)) latestMap.set(assessment.studentId, assessment); });
  return data.students.map((student) => ({ student, latest: latestMap.get(student.id) }));
}

function OverviewView({ data, atRisk, unassessed, checkedThisMonth, latestTeacherMap, setView, onStudentCheck }: { data: AcademicData; atRisk: ReturnType<typeof latestStudentRows>; unassessed: number; checkedThisMonth: number; latestTeacherMap: Map<number, TeacherReview>; setView: (view: View) => void; onStudentCheck: (student: StudentRow) => void }) {
  const teacherNeedsSupport = data.teachers.filter((teacher) => latestTeacherMap.get(teacher.id)?.result.startsWith("Cần")).length;
  return <div className="space-y-7">
    <SectionHeader eyebrow="Bảng điều hành" title="Tình hình học vụ hôm nay" description="Nắm nhanh các lớp, học viên cần hỗ trợ và hoạt động đánh giá gần đây." action={<Button onClick={() => setView("student-check")} className="bg-[#ff7a3d] hover:bg-[#e9652f]"><ClipboardCheck /> Bắt đầu kiểm tra</Button>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Học viên" value={data.students.length} note={`${data.classes.length} lớp đang quản lý`} icon={GraduationCap} tone="teal" /><MetricCard label="Đã kiểm tra tháng này" value={checkedThisMonth} note={`${unassessed} học viên chưa có đánh giá`} icon={ClipboardCheck} tone="navy" /><MetricCard label="Cần quan tâm" value={atRisk.length} note="Theo kết quả gần nhất" icon={AlertTriangle} tone="orange" /><MetricCard label="Giáo viên cần hỗ trợ" value={teacherNeedsSupport} note={`${data.teachers.length} giáo viên trong hệ thống`} icon={UserCheck} tone="gold" /></div>
    <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-lg">Học viên cần quan tâm</CardTitle><p className="mt-1 text-sm text-muted-foreground">Dựa trên lần kiểm tra gần nhất</p></div><Button variant="ghost" size="sm" onClick={() => setView("students")}>Xem tất cả <ChevronRight /></Button></CardHeader><CardContent>{atRisk.length ? <div className="grid gap-2 lg:grid-cols-2">{atRisk.slice(0, 8).map(({ student, latest }) => <button key={student.id} onClick={() => onStudentCheck(student)} className="flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition hover:border-[#7bcbd5] hover:shadow-sm"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff0e7] font-bold text-[#d95c25]">{student.name.charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{student.name}</p><p className="truncate text-xs text-muted-foreground">{student.className || "Chưa xếp lớp"} · {student.level}</p></div>{latest ? <div className="text-right"><ResultBadge value={latest.result} /><p className="mt-1 text-xs text-muted-foreground">{latest.overallScore}/5</p></div> : null}</button>)}</div> : <EmptyPanel icon={CheckCircle2} title="Chưa có cảnh báo" description="Các kết quả cần theo dõi sẽ xuất hiện tại đây." />}</CardContent></Card>
  </div>;
}

function StudentsView({ data, onAdd, onEdit, onDelete, onCheck }: { data: AcademicData; onAdd: () => void; onEdit: (item: StudentRow) => void; onDelete: (item: StudentRow) => void; onCheck: (item: StudentRow) => void }) {
  const [search, setSearch] = useState(""); const [classFilter, setClassFilter] = useState("all");
  const latest = useMemo(() => new Map(latestStudentRows(data).map((row) => [row.student.id, row.latest])), [data]);
  const rows = data.students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()) && (classFilter === "all" || String(student.classId) === classFilter));
  return <div className="space-y-6"><SectionHeader eyebrow="Quản lý dữ liệu" title="Học viên" description="Thêm, điều chỉnh lớp, trình độ và mở phiếu kiểm tra cho từng học viên." action={<Button onClick={onAdd}><Plus /> Thêm học viên</Button>} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên học viên..." className="pl-9" /></div><FormSelect value={classFilter} onChange={setClassFilter} placeholder="Lọc theo lớp" options={[{ value: "all", label: "Tất cả lớp" }, ...data.classes.map((item) => ({ value: String(item.id), label: item.name }))]} /></CardHeader><CardContent>{rows.length ? <Table><TableHeader><TableRow><TableHead>Học viên</TableHead><TableHead>Lớp / trình độ</TableHead><TableHead>Liên hệ</TableHead><TableHead>Kết quả gần nhất</TableHead><TableHead className="w-36 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{rows.map((student) => { const assessment = latest.get(student.id); return <TableRow key={student.id}><TableCell><p className="font-semibold">{student.name}</p><StatusBadge value={student.status} /></TableCell><TableCell><p>{student.className || "Chưa xếp lớp"}</p><p className="text-xs text-muted-foreground">{student.level}</p></TableCell><TableCell>{student.guardianPhone || "—"}</TableCell><TableCell>{assessment ? <div><ResultBadge value={assessment.result} /><p className="mt-1 text-xs text-muted-foreground">{assessment.overallScore}/5 · {formatDate(assessment.checkedAt)}</p></div> : <span className="text-sm text-muted-foreground">Chưa kiểm tra</span>}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="sm" variant="secondary" onClick={() => onCheck(student)}><ClipboardCheck /> Check</Button><Button size="icon-sm" variant="ghost" aria-label={`Sửa ${student.name}`} onClick={() => onEdit(student)}><Pencil /></Button><Button size="icon-sm" variant="ghost" aria-label={`Xóa ${student.name}`} className="text-destructive" onClick={() => onDelete(student)}><Trash2 /></Button></div></TableCell></TableRow>; })}</TableBody></Table> : <EmptyPanel icon={GraduationCap} title="Chưa có học viên phù hợp" description={search || classFilter !== "all" ? "Thử thay đổi từ khóa hoặc bộ lọc." : "Thêm học viên đầu tiên để bắt đầu theo dõi."} action={!search && classFilter === "all" ? <Button onClick={onAdd}><Plus /> Thêm học viên</Button> : undefined} />}</CardContent></Card></div>;
}

function normalizeSchedule(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function classRunsOnDate(schedule: string, date: string) {
  if (!schedule.trim()) return false;
  const weekday = new Date(`${date}T12:00:00+07:00`).getUTCDay();
  const normalized = normalizeSchedule(schedule).replace(/\d{1,2}:\d{2}/g, " ");
  if (weekday === 0) return /chu nhat|\bcn\b/.test(normalized);
  const vietnamDayNumber = weekday + 1;
  return new RegExp(`thu\\s*${vietnamDayNumber}|\\bt${vietnamDayNumber}\\b|(?:^|[^0-9])${vietnamDayNumber}(?:[^0-9]|$)`).test(normalized);
}

function ClassesView({ data, onAdd, onEdit, onDelete, onSchedule }: { data: AcademicData; onAdd: () => void; onEdit: (item: ClassRow) => void; onDelete: (item: ClassRow) => void; onSchedule: (classId: number, studentIds: number[], scheduledDate: string) => Promise<void> }) {
  const [date, setDate] = useState(today());
  const [filter, setFilter] = useState<"scheduled" | "all">("scheduled");
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const weekdayLabel = new Intl.DateTimeFormat("vi-VN", { weekday: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${date}T12:00:00+07:00`));
  const visibleClasses = data.classes.filter((item) => filter === "all" || classRunsOnDate(item.schedule, date));

  const openStudents = (item: ClassRow) => {
    if (expandedClassId === item.id) {
      setExpandedClassId(null);
      setSelectedStudentIds([]);
      return;
    }
    const queued = data.checkQueue.filter((queueItem) => queueItem.classId === item.id && queueItem.scheduledDate === date && queueItem.status === "pending").map((queueItem) => queueItem.studentId);
    setExpandedClassId(item.id);
    setSelectedStudentIds(queued);
  };

  const submitQueue = async (classId: number) => {
    if (!selectedStudentIds.length) return;
    setSaving(true);
    try {
      await onSchedule(classId, selectedStudentIds, date);
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
    <SectionHeader eyebrow="Quản lý dữ liệu" title="Lớp học" description="Lọc lớp theo lịch Việt Nam, chọn nhiều học viên và đưa thẳng vào danh sách kiểm tra." action={<Button onClick={onAdd}><Plus /> Thêm lớp</Button>} />
    <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(220px,320px)_1fr]"><div><Label htmlFor="class-filter-date" className="mb-2">Ngày cần kiểm tra</Label><Input id="class-filter-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setExpandedClassId(null); setSelectedStudentIds([]); }} /></div><div><Label className="mb-2">Hiển thị lớp</Label><div className="flex flex-wrap gap-2"><Button type="button" variant={filter === "scheduled" ? "default" : "outline"} onClick={() => setFilter("scheduled")}><CalendarDays /> Lớp theo lịch {weekdayLabel}</Button><Button type="button" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}><Building2 /> Tất cả lớp</Button></div></div></CardContent></Card>
    {visibleClasses.length ? <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleClasses.map((item) => {
      const classStudents = data.students.filter((student) => student.classId === item.id && student.status === "active");
      const allSelected = classStudents.length > 0 && classStudents.every((student) => selectedStudentIds.includes(student.id));
      return <Card key={item.id} className={`border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)] ${expandedClassId === item.id ? "ring-2 ring-[#2bb5c8]/30" : ""}`}><CardHeader className="pb-3"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-[#e1f4f6] text-[#0b6476]"><Building2 /></div><StatusBadge value={item.status} /></div><CardTitle className="pt-2 text-xl">{item.name}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm"><div><p className="text-xs text-muted-foreground">Trình độ</p><p className="font-semibold">{item.level}</p></div><div><p className="text-xs text-muted-foreground">Học viên</p><p className="font-semibold">{item.studentCount}</p></div></div><p className="flex gap-2 text-sm"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[#d95c25]" /><span>{item.schedule || "Chưa cập nhật lịch"}{item.room ? ` · ${item.room}` : ""}</span></p><p className="flex gap-2 text-sm"><UserCheck className="mt-0.5 size-4 shrink-0 text-[#0b6476]" /><span>{item.teacherName || "Chưa phân công giáo viên"}</span></p><Button type="button" variant={expandedClassId === item.id ? "secondary" : "outline"} className="w-full" onClick={() => openStudents(item)}><ClipboardCheck /> {expandedClassId === item.id ? "Đóng danh sách" : "Chọn học viên kiểm tra"}</Button>{expandedClassId === item.id ? <div className="space-y-3 rounded-xl border bg-slate-50/70 p-3"><label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-2 text-sm font-bold"><Checkbox checked={allSelected} onCheckedChange={(checked) => setSelectedStudentIds(checked ? classStudents.map((student) => student.id) : [])} />Chọn tất cả ({classStudents.length})</label><div className="max-h-60 space-y-2 overflow-y-auto">{classStudents.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-2.5 text-sm shadow-sm"><Checkbox checked={selectedStudentIds.includes(student.id)} onCheckedChange={(checked) => setSelectedStudentIds((current) => checked ? Array.from(new Set([...current, student.id])) : current.filter((studentId) => studentId !== student.id))} /><span className="min-w-0 flex-1 truncate font-medium">{student.name}</span></label>)}</div>{classStudents.length ? <Button type="button" className="w-full bg-[#ff7a3d] hover:bg-[#e9652f]" disabled={!selectedStudentIds.length || saving} onClick={() => void submitQueue(item.id)}>{saving ? <LoaderCircle className="animate-spin" /> : <ClipboardCheck />} Đưa {selectedStudentIds.length} học viên vào kiểm tra</Button> : <p className="py-3 text-center text-sm text-muted-foreground">Lớp chưa có học viên đang học.</p>}</div> : null}<Separator /><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => onEdit(item)}><Pencil /> Chỉnh sửa</Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => onDelete(item)} aria-label={`Xóa ${item.name}`}><Trash2 /></Button></div></CardContent></Card>;
    })}</div> : <EmptyPanel icon={CalendarDays} title="Không có lớp theo bộ lọc" description={filter === "scheduled" ? `Chưa có lớp nào có lịch vào ${weekdayLabel}. Hãy kiểm tra nội dung Lịch học hoặc chọn Tất cả lớp.` : "Chưa có lớp học trong hệ thống."} action={filter === "scheduled" ? <Button variant="outline" onClick={() => setFilter("all")}><Building2 /> Xem tất cả lớp</Button> : <Button onClick={onAdd}><Plus /> Thêm lớp</Button>} />}
  </div>;
}

function LevelOptionsView({ data, onAdd, onEdit, onDelete }: { data: AcademicData; onAdd: () => void; onEdit: (item: LevelOption) => void; onDelete: (item: LevelOption) => void }) {
  return <div className="space-y-6"><SectionHeader eyebrow="Cấu hình hệ thống" title="Chương trình và trình độ" description="Bạn có thể thêm, đổi tên, sắp xếp hoặc tạm ẩn các lựa chọn dùng khi tạo lớp và học viên. Khi đổi tên, dữ liệu lớp và học viên hiện có cũng được cập nhật." action={<Button onClick={onAdd}><Plus /> Thêm trình độ</Button>} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Chương trình / trình độ</TableHead><TableHead>Khung đánh giá liên kết</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-28 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{data.levelOptions.map((item) => { const linked = programs.find((program) => program.code === item.programCode); return <TableRow key={item.id}><TableCell className="font-semibold">{item.label}</TableCell><TableCell>{linked ? <div><p className="font-medium">{linked.series}</p><p className="text-xs text-muted-foreground">{linked.label}</p></div> : <span className="text-sm text-muted-foreground">Không có khung kiểm tra tự động</span>}</TableCell><TableCell>{item.sortOrder}</TableCell><TableCell><Badge variant="outline" className={item.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}>{item.active ? "Đang dùng" : "Tạm ẩn"}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" onClick={() => onEdit(item)} aria-label={`Sửa ${item.label}`}><Pencil /></Button><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(item)} aria-label={`Xóa ${item.label}`}><Trash2 /></Button></div></TableCell></TableRow>; })}</TableBody></Table></CardContent></Card></div>;
}

function FeedbackOptionsView({ data, onAdd, onEdit, onDelete }: { data: AcademicData; onAdd: () => void; onEdit: (item: FeedbackOption) => void; onDelete: (item: FeedbackOption) => void }) {
  return <div className="space-y-6"><SectionHeader eyebrow="Cấu hình hệ thống" title="Mẫu nhận xét học viên" description="Tạo các nhận xét thường gặp để giáo viên chỉ cần tick khi đánh giá. Nội dung đã chọn được lưu cùng kết quả và hiển thị trong báo cáo." action={<Button onClick={onAdd}><Plus /> Thêm mẫu nhận xét</Button>} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="pt-6">{data.feedbackOptions.length ? <Table><TableHeader><TableRow><TableHead className="w-48">Nhóm</TableHead><TableHead>Nội dung nhận xét</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-28 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{data.feedbackOptions.map((item) => <TableRow key={item.id}><TableCell><Badge variant="secondary">{item.category}</Badge></TableCell><TableCell className="whitespace-normal font-medium">{item.label}</TableCell><TableCell>{item.sortOrder}</TableCell><TableCell><Badge variant="outline" className={item.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}>{item.active ? "Đang dùng" : "Tạm ẩn"}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" onClick={() => onEdit(item)} aria-label={`Sửa ${item.label}`}><Pencil /></Button><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(item)} aria-label={`Xóa ${item.label}`}><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody></Table> : <EmptyPanel icon={ListChecks} title="Chưa có mẫu nhận xét" description="Thêm các tình huống thường gặp để giáo viên lựa chọn nhanh khi kiểm tra học viên." action={<Button onClick={onAdd}><Plus /> Thêm mẫu đầu tiên</Button>} />}</CardContent></Card></div>;
}

function TeachersView({ data, latestTeacherMap, onAdd, onEdit, onDelete, onReview }: { data: AcademicData; latestTeacherMap: Map<number, TeacherReview>; onAdd: () => void; onEdit: (item: TeacherRow) => void; onDelete: (item: TeacherRow) => void; onReview: (item: TeacherRow) => void }) {
  return <div className="space-y-6"><SectionHeader eyebrow="Quản lý dữ liệu" title="Giáo viên" description="Theo dõi phân công lớp, trạng thái làm việc và kết quả dự giờ gần nhất." action={<Button onClick={onAdd}><Plus /> Thêm giáo viên</Button>} /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="pt-6">{data.teachers.length ? <Table><TableHeader><TableRow><TableHead>Giáo viên</TableHead><TableHead>Liên hệ</TableHead><TableHead>Phân công</TableHead><TableHead>Đánh giá gần nhất</TableHead><TableHead className="w-44 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{data.teachers.map((teacher) => { const review = latestTeacherMap.get(teacher.id); return <TableRow key={teacher.id}><TableCell><p className="font-semibold">{teacher.name}</p><p className="text-xs text-muted-foreground">{teacher.specialization || "Chưa cập nhật chuyên môn"}</p><div className="mt-1"><StatusBadge value={teacher.status} /></div></TableCell><TableCell><p>{teacher.phone || "—"}</p><p className="text-xs text-muted-foreground">{teacher.email}</p></TableCell><TableCell>{teacher.classCount} lớp</TableCell><TableCell>{review ? <div><ResultBadge value={review.result} /><p className="mt-1 text-xs text-muted-foreground">{review.overallScore}/5 · {formatDate(review.observedAt)}</p></div> : <span className="text-sm text-muted-foreground">Chưa đánh giá</span>}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="sm" variant="secondary" onClick={() => onReview(teacher)}><UserCheck /> Đánh giá</Button><Button size="icon-sm" variant="ghost" onClick={() => onEdit(teacher)} aria-label={`Sửa ${teacher.name}`}><Pencil /></Button><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(teacher)} aria-label={`Xóa ${teacher.name}`}><Trash2 /></Button></div></TableCell></TableRow>; })}</TableBody></Table> : <EmptyPanel icon={Users} title="Chưa có giáo viên" description="Thêm giáo viên để phân công lớp và theo dõi chất lượng giảng dạy." action={<Button onClick={onAdd}><Plus /> Thêm giáo viên</Button>} />}</CardContent></Card></div>;
}

function CriteriaView({ data, onAdd, onEdit, onDelete, onSeed }: { data: AcademicData; onAdd: () => void; onEdit: (item: CriterionRow) => void; onDelete: (item: CriterionRow) => void; onSeed: () => void }) {
  const [target, setTarget] = useState("teacher"); const rows = data.criteria.filter((item) => item.targetType === target);
  return <div className="space-y-6"><SectionHeader eyebrow="Cấu hình hệ thống" title="Tiêu chí đánh giá bổ sung" description="Tiêu chí học viên theo chương trình nằm trong Khung chương trình. Tại đây bạn có thể cấu hình bộ đánh giá giáo viên và các tiêu chí bổ sung." action={<Button onClick={onAdd}><Plus /> Thêm tiêu chí</Button>} /><div className="flex gap-2"><Button variant={target === "teacher" ? "default" : "outline"} onClick={() => setTarget("teacher")}>Giáo viên</Button><Button variant={target === "student" ? "default" : "outline"} onClick={() => setTarget("student")}>Học viên bổ sung</Button></div><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="pt-6">{rows.length ? <Table><TableHeader><TableRow><TableHead>Nhóm</TableHead><TableHead>Nội dung đánh giá</TableHead><TableHead>Trình độ</TableHead><TableHead>Trọng số</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-28 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.id}><TableCell><Badge variant="secondary">{item.category}</Badge></TableCell><TableCell className="max-w-xl whitespace-normal"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description || "Không có mô tả"}</p></TableCell><TableCell>{item.level === "ALL" ? "Tất cả" : item.level}</TableCell><TableCell>x{item.weight}</TableCell><TableCell><Badge variant="outline" className={item.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}>{item.active ? "Đang dùng" : "Tạm ẩn"}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" onClick={() => onEdit(item)} aria-label={`Sửa ${item.title}`}><Pencil /></Button><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(item)} aria-label={`Xóa ${item.title}`}><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody></Table> : <EmptyPanel icon={Settings2} title="Chưa có tiêu chí" description="Bạn có thể tạo từng tiêu chí hoặc nạp bộ khung gợi ý để chỉnh sửa." action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={onSeed} variant="secondary"><Sparkles /> Nạp bộ khung gợi ý</Button><Button onClick={onAdd}><Plus /> Tạo tiêu chí</Button></div>} />}</CardContent></Card></div>;
}

// Retained only to read and manage legacy criterion-based evaluations already stored in the database.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StudentCheckView({ data, selectedClassId, setSelectedClassId, selectedStudentId, setSelectedStudentId, onSaved, setView }: { data: AcademicData; selectedClassId: string; setSelectedClassId: (value: string) => void; selectedStudentId: string; setSelectedStudentId: (value: string) => void; onSaved: () => Promise<void> | void; setView: (view: View) => void }) {
  const students = data.students.filter((item) => !selectedClassId || String(item.classId) === selectedClassId);
  const student = data.students.find((item) => String(item.id) === selectedStudentId);
  const classInfo = data.classes.find((item) => String(item.id) === selectedClassId);
  const rows = data.criteria.filter((item) => item.targetType === "student" && item.active && student && (item.level === "ALL" || item.level === student.level));
  const [scores, setScores] = useState<Record<number, string>>({});
  const [checkedAt, setCheckedAt] = useState(today()); const [summary, setSummary] = useState(""); const [actionPlan, setActionPlan] = useState(""); const [saving, setSaving] = useState(false);
  const score = rows.length ? rows.reduce((sum, item) => sum + Number(scores[item.id] || 3) * item.weight, 0) / rows.reduce((sum, item) => sum + item.weight, 0) : 0;
  const save = async () => { if (!student || !rows.length) return; setSaving(true); try { await postAction("createStudentAssessment", { studentId: student.id, checkedAt, summary, actionPlan, items: rows.map((item) => ({ criterionId: item.id, score: Number(scores[item.id] || 3) })) }); await onSaved(); setSummary(""); setActionPlan(""); toast.success("Đã lưu kết quả kiểm tra học viên."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu đánh giá."); } finally { setSaving(false); } };
  return <div className="space-y-6"><SectionHeader eyebrow="Academic Leader" title="Kiểm tra tình hình học viên" description="Chọn lớp, chọn học viên, sau đó chấm bộ tiêu chí đúng với trình độ hiện tại." /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="grid gap-4 p-5 md:grid-cols-2"><div><Label className="mb-2">1. Chọn lớp</Label><FormSelect value={selectedClassId} onChange={(value) => { setSelectedClassId(value); setSelectedStudentId(""); }} placeholder="Chọn lớp cần kiểm tra" options={data.classes.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.level}` }))} /></div><div><Label className="mb-2">2. Chọn học viên</Label><FormSelect value={selectedStudentId} onChange={setSelectedStudentId} placeholder="Chọn học viên" disabled={!selectedClassId} options={students.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.level}` }))} /></div></CardContent></Card>{student ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-4"><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-xl">{student.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{classInfo?.name} · {student.level} · {classInfo?.schedule || "Chưa cập nhật lịch"}</p></div><Badge className="bg-[#ff7a3d]">Điểm dự kiến {score.toFixed(1)}/5</Badge></div></CardHeader><CardContent>{rows.length ? <div className="space-y-3">{rows.map((criterion, index) => <ScoreRow key={criterion.id} index={index + 1} criterion={criterion} value={scores[criterion.id] || "3"} onChange={(value) => setScores((current) => ({ ...current, [criterion.id]: value }))} />)}</div> : <EmptyPanel icon={Settings2} title="Chưa có tiêu chí phù hợp" description={`Hãy tạo tiêu chí chung hoặc tiêu chí cho trình độ ${student.level}.`} action={<Button onClick={() => setView("criteria")}><Settings2 /> Mở bộ tiêu chí</Button>} />}</CardContent></Card></div><Card className="h-fit border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><CardTitle className="text-lg">Kết luận & hành động</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="student-date">Ngày kiểm tra</Label><Input id="student-date" type="date" value={checkedAt} onChange={(e) => setCheckedAt(e.target.value)} /></div><div><Label htmlFor="student-summary">Nhận xét tổng quan</Label><Textarea id="student-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Điểm mạnh, vấn đề cần lưu ý..." rows={4} /></div><div><Label htmlFor="student-action">Kế hoạch hỗ trợ</Label><Textarea id="student-action" value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} placeholder="Việc cần làm, người phụ trách, thời hạn..." rows={4} /></div><Button className="w-full bg-[#ff7a3d] hover:bg-[#e9652f]" onClick={save} disabled={saving || !rows.length}>{saving ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />} Lưu kết quả kiểm tra</Button></CardContent></Card></div> : <EmptyPanel icon={ClipboardCheck} title="Chọn lớp và học viên" description="Thông tin lớp, trình độ và bộ tiêu chí tương ứng sẽ tự động hiển thị." />}</div>;
}

function TeacherReviewView({ data, selectedTeacherId, setSelectedTeacherId, onSaved, setView }: { data: AcademicData; selectedTeacherId: string; setSelectedTeacherId: (value: string) => void; onSaved: () => Promise<void> | void; setView: (view: View) => void }) {
  const teacher = data.teachers.find((item) => String(item.id) === selectedTeacherId); const rows = data.criteria.filter((item) => item.targetType === "teacher" && item.active);
  const [scores, setScores] = useState<Record<number, string>>({}); const [observedAt, setObservedAt] = useState(today()); const [summary, setSummary] = useState(""); const [actionPlan, setActionPlan] = useState(""); const [saving, setSaving] = useState(false);
  const score = rows.length ? rows.reduce((sum, item) => sum + Number(scores[item.id] || 3) * item.weight, 0) / rows.reduce((sum, item) => sum + item.weight, 0) : 0;
  const save = async () => { if (!teacher || !rows.length) return; setSaving(true); try { await postAction("createTeacherReview", { teacherId: teacher.id, observedAt, summary, actionPlan, items: rows.map((item) => ({ criterionId: item.id, score: Number(scores[item.id] || 3) })) }); await onSaved(); setSummary(""); setActionPlan(""); toast.success("Đã lưu kết quả đánh giá giáo viên."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu đánh giá."); } finally { setSaving(false); } };
  return <div className="space-y-6"><SectionHeader eyebrow="Academic Manager" title="Dự giờ & đánh giá giáo viên" description="Ghi nhận chất lượng giảng dạy, vấn đề cần hỗ trợ và kế hoạch cải thiện." /><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardContent className="p-5"><Label className="mb-2">Chọn giáo viên</Label><FormSelect value={selectedTeacherId} onChange={setSelectedTeacherId} placeholder="Chọn giáo viên cần đánh giá" options={data.teachers.map((item) => ({ value: String(item.id), label: `${item.name} · ${item.classCount} lớp` }))} /></CardContent></Card>{teacher ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-xl">{teacher.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{teacher.specialization || "Chưa cập nhật chuyên môn"} · {teacher.classCount} lớp phụ trách</p></div><Badge className="bg-[#0b5c75]">Điểm dự kiến {score.toFixed(1)}/5</Badge></div></CardHeader><CardContent>{rows.length ? <div className="space-y-3">{rows.map((criterion, index) => <ScoreRow key={criterion.id} index={index + 1} criterion={criterion} value={scores[criterion.id] || "3"} onChange={(value) => setScores((current) => ({ ...current, [criterion.id]: value }))} />)}</div> : <EmptyPanel icon={Settings2} title="Chưa có tiêu chí giáo viên" description="Tạo tiêu chí dành cho giáo viên trước khi đánh giá." action={<Button onClick={() => setView("criteria")}><Settings2 /> Mở bộ tiêu chí</Button>} />}</CardContent></Card><Card className="h-fit border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><CardTitle className="text-lg">Kết luận sau dự giờ</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="teacher-date">Ngày dự giờ</Label><Input id="teacher-date" type="date" value={observedAt} onChange={(e) => setObservedAt(e.target.value)} /></div><div><Label htmlFor="teacher-summary">Nhận xét tổng quan</Label><Textarea id="teacher-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Điểm tốt và vấn đề cần lưu ý..." rows={4} /></div><div><Label htmlFor="teacher-action">Kế hoạch hỗ trợ</Label><Textarea id="teacher-action" value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} placeholder="Hỗ trợ chuyên môn, theo dõi lại..." rows={4} /></div><Button className="w-full" onClick={save} disabled={saving || !rows.length}>{saving ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />} Lưu kết quả đánh giá</Button></CardContent></Card></div> : <EmptyPanel icon={UserCheck} title="Chọn giáo viên cần đánh giá" description="Bộ tiêu chí dành cho giáo viên sẽ được hiển thị tự động." />}</div>;
}

function ScoreRow({ index, criterion, value, onChange }: { index: number; criterion: CriterionRow; value: string; onChange: (value: string) => void }) {
  return <div className="rounded-xl border bg-white p-4"><div className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e4f1f4] text-xs font-bold text-[#0b5c75]">{index}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{criterion.title}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{criterion.description}</p></div><Badge variant="secondary">{criterion.category} · x{criterion.weight}</Badge></div><RadioGroup value={value} onValueChange={onChange} className="mt-4 grid grid-cols-5 gap-2">{[1,2,3,4,5].map((number) => <label key={number} className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-semibold transition ${value === String(number) ? "border-[#2bb5c8] bg-[#e1f4f6] text-[#0b5c75]" : "hover:bg-slate-50"}`}><RadioGroupItem value={String(number)} className="sr-only" />{number}</label>)}</RadioGroup><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>Cần hỗ trợ</span><span>Vượt kỳ vọng</span></div></div></div></div>;
}

function ReportsView({ data, onDeleteAssessment, onDeleteLearningCheck, onDeleteReview }: { data: AcademicData; onDeleteAssessment: (item: StudentAssessment) => void; onDeleteLearningCheck: (item: LearningCheck) => void; onDeleteReview: (item: TeacherReview) => void }) {
  const [mode, setMode] = useState<"students" | "teachers">("students");
  const [selectedZone, setSelectedZone] = useState<"good" | "average" | "redflag" | null>(null);
  const studentHistory = studentProgressRecords(data);
  const assessedStudents = latestStudentRows(data).filter((row): row is { student: StudentRow; latest: StudentProgressRecord } => Boolean(row.latest));
  const good = assessedStudents.filter((row) => reportBucket(row.latest.result) === "good");
  const average = assessedStudents.filter((row) => reportBucket(row.latest.result) === "average");
  const redflag = assessedStudents.filter((row) => reportBucket(row.latest.result) === "redflag");
  const avgTeacher = data.teacherReviews.length ? data.teacherReviews.reduce((sum, item) => sum + item.overallScore, 0) / data.teacherReviews.length : 0;
  const removeStudentResult = (item: StudentProgressRecord) => item.source === "curriculum" ? onDeleteLearningCheck(data.learningChecks.find((check) => check.id === item.id)!) : onDeleteAssessment(data.studentAssessments.find((assessment) => assessment.id === item.id)!);
  const zones = { good: { title: "Good", subtitle: "Đạt kết quả tốt", rows: good, tone: "good" as const }, average: { title: "Average", subtitle: "Đạt mức trung bình", rows: average, tone: "average" as const }, redflag: { title: "Redflag", subtitle: "Cần theo dõi hoặc hỗ trợ", rows: redflag, tone: "redflag" as const } };
  return <div className="space-y-7"><SectionHeader eyebrow="Academic Report" title={mode === "students" ? "Báo cáo tình hình học viên" : "Báo cáo tình hình giáo viên"} description={mode === "students" ? `${assessedStudents.length}/${data.students.length} học viên đã có kết quả gần nhất · ${studentHistory.length} lượt kiểm tra đã lưu.` : "Tổng hợp lịch sử dự giờ và đánh giá giáo viên."} /><div className="flex flex-wrap gap-2"><Button variant={mode === "students" ? "default" : "outline"} onClick={() => { setMode("students"); setSelectedZone(null); }}><GraduationCap /> Học viên</Button><Button variant={mode === "teachers" ? "default" : "outline"} onClick={() => setMode("teachers")}><UserCheck /> Giáo viên</Button></div>{mode === "students" ? <>{selectedZone ? <div className="space-y-4"><Button variant="outline" onClick={() => setSelectedZone(null)}>← Quay lại tổng quan 3 mức độ</Button><StudentZone title={zones[selectedZone].title} subtitle={zones[selectedZone].subtitle} rows={zones[selectedZone].rows} tone={zones[selectedZone].tone} onDelete={removeStudentResult} /></div> : <div className="grid gap-5 md:grid-cols-3"><ResultSummaryCard title="Good" count={good.length} total={assessedStudents.length} description="Không có tiêu chí chính thuộc Redflag và điểm trung bình trên 80%." tone="good" onClick={() => setSelectedZone("good")} /><ResultSummaryCard title="Average" count={average.length} total={assessedStudents.length} description="Không có tiêu chí chính thuộc Redflag và điểm trung bình từ 80% trở xuống." tone="average" onClick={() => setSelectedZone("average")} /><ResultSummaryCard title="Redflag" count={redflag.length} total={assessedStudents.length} description="Có ít nhất một tiêu chí chính dưới ngưỡng của chương trình." tone="redflag" onClick={() => setSelectedZone("redflag")} /></div>}<p className="text-center text-sm text-muted-foreground">{data.students.length - assessedStudents.length} học viên chưa có đánh giá gần nhất.</p></> : <div className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><MetricCard label="Lượt đánh giá giáo viên" value={data.teacherReviews.length} note="Tất cả lịch sử đã lưu" icon={UserCheck} tone="navy" /><MetricCard label="Điểm TB giáo viên" value={avgTeacher.toFixed(1)} note="Thang điểm 5" icon={Users} tone="gold" /></div><HistoryCard title="Lịch sử giáo viên" empty="Chưa có lần đánh giá giáo viên nào." rows={data.teacherReviews.slice(0, 50).map((item) => ({ id: item.id, name: item.teacherName, meta: `${item.reviewerName} · ${formatDate(item.observedAt)}`, score: item.overallScore, result: item.result, onDelete: () => onDeleteReview(item) }))} /></div>}</div>;
}

function ResultSummaryCard({ title, count, total, description, tone, onClick }: { title: string; count: number; total: number; description: string; tone: "good" | "average" | "redflag"; onClick: () => void }) {
  const styles = { good: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400", average: "border-amber-200 bg-amber-50 text-amber-950 hover:border-amber-400", redflag: "border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-400" }[tone];
  return <button type="button" onClick={onClick} className={`rounded-2xl border p-6 text-left shadow-[0_10px_30px_rgba(18,48,67,0.07)] transition hover:-translate-y-0.5 hover:shadow-lg ${styles}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xl font-bold">{title}</p><p className="mt-1 text-sm opacity-75">{description}</p></div><span className="rounded-xl bg-white/80 px-4 py-2 text-3xl font-bold shadow-sm">{count}</span></div><div className="mt-6 flex items-center justify-between text-sm font-semibold"><span>{total ? Math.round((count / total) * 100) : 0}% học viên đã đánh giá</span><span>Xem danh sách →</span></div></button>;
}

function StudentZone({ title, subtitle, rows, tone, onDelete }: { title: string; subtitle: string; rows: { student: StudentRow; latest: StudentProgressRecord }[]; tone: "good" | "average" | "redflag"; onDelete: (item: StudentProgressRecord) => void }) {
  const styles = { good: { border: "border-emerald-200", header: "bg-emerald-50 text-emerald-800", count: "bg-emerald-600" }, average: { border: "border-amber-200", header: "bg-amber-50 text-amber-900", count: "bg-amber-500" }, redflag: { border: "border-rose-200", header: "bg-rose-50 text-rose-800", count: "bg-rose-600" } }[tone];
  return <Card className={`overflow-hidden border ${styles.border} shadow-[0_10px_30px_rgba(18,48,67,0.07)]`}><CardHeader className={styles.header}><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-xl">{title}</CardTitle><p className="mt-1 text-sm opacity-80">{subtitle}</p></div><Badge className={`${styles.count} text-white`}>{rows.length}</Badge></div></CardHeader><CardContent className="p-4">{rows.length ? <div className="grid gap-3 lg:grid-cols-2">{rows.map(({ student, latest }) => <div key={student.id} className="rounded-xl border bg-white p-3"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-[#345064]">{student.name.charAt(0)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{student.name}</p><ResultBadge value={latest.result} /></div><p className="mt-1 text-xs text-muted-foreground">{student.className || "Chưa xếp lớp"} · {student.level}</p><p className="mt-1 text-xs text-muted-foreground">{latest.programLabel ? `${latest.programLabel} · ${latest.unitLabel} · ` : ""}{formatDate(latest.checkedAt)} · {latest.teacherName || "Chưa ghi tên giáo viên"}</p></div><Button size="icon-sm" variant="ghost" className="shrink-0 text-destructive" onClick={() => onDelete(latest)} aria-label={`Xóa đánh giá của ${student.name}`}><Trash2 /></Button></div><div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Nhận xét / lý do</p><p className="mt-1 whitespace-pre-line text-sm leading-5 text-[#345064]">{latest.reason || "Chưa có nhận xét hoặc lý do chi tiết."}</p></div><p className="mt-2 text-right text-xs font-bold">{latest.overallScore}/5</p></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có học viên trong vùng này.</p>}</CardContent></Card>;
}

function HistoryCard({ title, empty, rows }: { title: string; empty: string; rows: { id: number | string; name: string; meta: string; score: number; result: string; onDelete: () => void }[] }) {
  return <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]"><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent>{rows.length ? <div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{row.name}</p><p className="truncate text-xs text-muted-foreground">{row.meta}</p></div><div className="text-right"><ResultBadge value={row.result} /><p className="mt-1 text-xs font-semibold">{row.score}/5</p></div><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={row.onDelete} aria-label="Xóa đánh giá"><Trash2 /></Button></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>}</CardContent></Card>;
}

function FormSelect({ value, onChange, options, placeholder, disabled = false }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder: string; disabled?: boolean }) {
  return <Select value={value || undefined} onValueChange={onChange} disabled={disabled}><SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
}

function EntityDialog({ config, data, onClose, onSave }: { config: { kind: EntityKind; item?: DataRow }; data: AcademicData; onClose: () => void; onSave: (action: string, payload: Record<string, unknown>) => void }) {
  const item = config.item; const editing = Boolean(item); const kindLabels = { class: "lớp học", student: "học viên", teacher: "giáo viên", criterion: "tiêu chí", levelOption: "chương trình hoặc trình độ", feedbackOption: "mẫu nhận xét" };
  const availableLevels = Array.from(new Set([...data.levelOptions.filter((option) => option.active || option.label === item?.level).map((option) => option.label), String(item?.level || "")].filter(Boolean)));
  const defaultLevel = availableLevels[0] || programs[0].label;
  const [form, setForm] = useState<Record<string, string>>({
    name: String(item?.name ?? ""), label: String(item?.label ?? ""), programCode: String(item?.programCode || "none"), level: String(item?.level ?? (config.kind === "criterion" ? "ALL" : defaultLevel)), schedule: String(item?.schedule ?? ""), room: String(item?.room ?? ""), teacherId: item?.teacherId ? String(item.teacherId) : "none", classId: item?.classId ? String(item.classId) : "none", guardianPhone: String(item?.guardianPhone ?? ""), status: String(item?.status ?? "active"), note: String(item?.note ?? ""), email: String(item?.email ?? ""), phone: String(item?.phone ?? ""), specialization: String(item?.specialization ?? ""), targetType: String(item?.targetType ?? "teacher"), category: String(item?.category ?? ""), title: String(item?.title ?? ""), description: String(item?.description ?? ""), weight: String(item?.weight ?? "1"), active: Number(item?.active ?? 1) ? "1" : "0", sortOrder: String(item?.sortOrder ?? "0"),
  });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const action = `${editing ? "update" : "create"}${config.kind.charAt(0).toUpperCase()}${config.kind.slice(1)}`;
  const submit = () => onSave(action, { ...(editing ? { id: item?.id } : {}), ...form, programCode: form.programCode === "none" ? "" : form.programCode, teacherId: form.teacherId === "none" ? null : Number(form.teacherId), classId: form.classId === "none" ? null : Number(form.classId), weight: Number(form.weight), active: form.active === "1", sortOrder: Number(form.sortOrder) });
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? "Chỉnh sửa" : "Thêm"} {kindLabels[config.kind]}</DialogTitle><DialogDescription>Các thay đổi sẽ được cập nhật vào hệ thống ngay sau khi lưu.</DialogDescription></DialogHeader><div className="grid gap-4 py-2">
    {config.kind === "class" && <><Field label="Tên lớp *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Super Kids 3 - 01" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Chương trình / trình độ *"><FormSelect value={form.level} onChange={(v) => set("level", v)} placeholder="Chọn chương trình" options={availableLevels.map((v) => ({ value: v, label: v }))} /></Field><Field label="Trạng thái"><FormSelect value={form.status} onChange={(v) => set("status", v)} placeholder="Chọn trạng thái" options={[{ value: "active", label: "Đang hoạt động" }, { value: "paused", label: "Tạm dừng" }, { value: "completed", label: "Đã kết thúc" }]} /></Field></div><Field label="Lịch học"><Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="VD: Thứ 2, 4, 6 · 18:00–19:30" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Phòng"><Input value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="VD: P.203" /></Field><Field label="Giáo viên phụ trách"><FormSelect value={form.teacherId} onChange={(v) => set("teacherId", v)} placeholder="Chọn giáo viên" options={[{ value: "none", label: "Chưa phân công" }, ...data.teachers.map((v) => ({ value: String(v.id), label: v.name }))]} /></Field></div></>}
    {config.kind === "student" && <><Field label="Họ và tên *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nhập họ tên học viên" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Lớp"><FormSelect value={form.classId} onChange={(v) => { set("classId", v); const selected = data.classes.find((item) => String(item.id) === v); if (selected) set("level", selected.level); }} placeholder="Chọn lớp" options={[{ value: "none", label: "Chưa xếp lớp" }, ...data.classes.map((v) => ({ value: String(v.id), label: v.name }))]} /></Field><Field label="Trình độ *"><FormSelect value={form.level} onChange={(v) => set("level", v)} placeholder="Chọn trình độ" options={availableLevels.map((v) => ({ value: v, label: v }))} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="SĐT phụ huynh"><Input value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} /></Field><Field label="Trạng thái"><FormSelect value={form.status} onChange={(v) => set("status", v)} placeholder="Chọn trạng thái" options={[{ value: "active", label: "Đang học" }, { value: "paused", label: "Tạm nghỉ" }, { value: "completed", label: "Đã kết thúc" }]} /></Field></div><Field label="Ghi chú"><Textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} /></Field></>}
    {config.kind === "teacher" && <><Field label="Họ và tên *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nhập họ tên giáo viên" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Số điện thoại"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field><Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Chuyên môn"><Input value={form.specialization} onChange={(e) => set("specialization", e.target.value)} placeholder="VD: IELTS, Young Learners" /></Field><Field label="Trạng thái"><FormSelect value={form.status} onChange={(v) => set("status", v)} placeholder="Chọn trạng thái" options={[{ value: "active", label: "Đang làm việc" }, { value: "leave", label: "Nghỉ phép" }, { value: "paused", label: "Tạm dừng" }]} /></Field></div><Field label="Ghi chú"><Textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} /></Field></>}
    {config.kind === "criterion" && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Đối tượng *"><FormSelect value={form.targetType} onChange={(v) => set("targetType", v)} placeholder="Chọn đối tượng" options={[{ value: "student", label: "Học viên" }, { value: "teacher", label: "Giáo viên" }]} /></Field>{form.targetType === "student" ? <Field label="Trình độ"><FormSelect value={form.level} onChange={(v) => set("level", v)} placeholder="Chọn trình độ" options={[{ value: "ALL", label: "Tất cả trình độ" }, ...availableLevels.map((v) => ({ value: v, label: v }))]} /></Field> : null}</div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nhóm tiêu chí *"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="VD: Kỹ năng" /></Field><Field label="Trọng số"><FormSelect value={form.weight} onChange={(v) => set("weight", v)} placeholder="Chọn trọng số" options={[1,2,3,4,5].map((v) => ({ value: String(v), label: `x${v}` }))} /></Field></div><Field label="Nội dung đánh giá *"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Mức độ nắm bài" /></Field><Field label="Mô tả / hướng dẫn chấm"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field><Field label="Trạng thái"><FormSelect value={form.active} onChange={(v) => set("active", v)} placeholder="Chọn trạng thái" options={[{ value: "1", label: "Đang sử dụng" }, { value: "0", label: "Tạm ẩn" }]} /></Field></>}
    {config.kind === "levelOption" && <><Field label="Tên chương trình / trình độ *"><Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="VD: Super Kids 9" /></Field><Field label="Khung đánh giá liên kết"><FormSelect value={form.programCode} onChange={(v) => set("programCode", v)} placeholder="Chọn khung" options={[{ value: "none", label: "Không có khung kiểm tra tự động" }, ...programs.map((program) => ({ value: program.code, label: `${program.label} · ${program.series}` }))]} /></Field><p className="text-xs leading-5 text-muted-foreground">Nếu đây chỉ là một trình độ quản lý như A1, B1 hoặc IELTS, bạn có thể chọn không liên kết. Nếu đổi tên một chương trình đang có, hãy giữ nguyên khung liên kết.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Thứ tự hiển thị"><Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></Field><Field label="Trạng thái"><FormSelect value={form.active} onChange={(v) => set("active", v)} placeholder="Chọn trạng thái" options={[{ value: "1", label: "Đang sử dụng" }, { value: "0", label: "Tạm ẩn" }]} /></Field></div></>}
    {config.kind === "feedbackOption" && <><Field label="Nhóm nhận xét *"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="VD: Điểm mạnh, Cần cải thiện" /></Field><Field label="Nội dung nhận xét *"><Textarea value={form.label} onChange={(e) => set("label", e.target.value)} rows={3} placeholder="VD: Chưa chắc cấu trúc ngữ pháp" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Thứ tự hiển thị"><Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></Field><Field label="Trạng thái"><FormSelect value={form.active} onChange={(v) => set("active", v)} placeholder="Chọn trạng thái" options={[{ value: "1", label: "Đang sử dụng" }, { value: "0", label: "Tạm ẩn" }]} /></Field></div></>}
  </div><DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={submit}>Lưu thay đổi</Button></DialogFooter></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
