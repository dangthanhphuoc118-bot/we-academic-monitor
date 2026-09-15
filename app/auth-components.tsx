"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BookOpenCheck,
  KeyRound,
  LoaderCircle,
  LogIn,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AuthRole = "admin" | "academic_manager" | "academic_leader";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
};

type AccountRow = CurrentUser & {
  active: number;
  createdAt: string;
  updatedAt: string;
};

export const roleLabels: Record<AuthRole, string> = {
  admin: "Admin",
  academic_manager: "Academic Manager",
  academic_leader: "Academic Leader",
};

async function authAction(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = (await response.json()) as {
    error?: string;
    user?: CurrentUser;
    users?: AccountRow[];
  };
  if (!response.ok) throw new Error(result.error || "Không thể thực hiện yêu cầu.");
  return result;
}

export function LoginScreen({
  setupRequired,
  onAuthenticated,
}: {
  setupRequired: boolean;
  onAuthenticated: (user: CurrentUser) => void;
}) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (setupRequired) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await authAction("login", { email, pin });
      if (result.user) onAuthenticated(result.user);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="academic-grid grid min-h-screen place-items-center bg-[#f3f6f8] p-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-[0_24px_70px_rgba(18,48,67,0.16)]">
        <div className="h-2 bg-gradient-to-r from-[#0b6476] via-[#2bb5c8] to-[#ff7a3d]" />
        <CardHeader className="items-center pb-3 pt-8 text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#ff7a3d] text-white shadow-lg shadow-orange-950/20">
            <BookOpenCheck className="size-7" />
          </div>
          <CardTitle className="text-2xl text-[#102233]">Đăng nhập WE Academic</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Sử dụng email và mã PIN được Admin cấp.
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          {setupRequired ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-bold">Chưa có tài khoản Admin ban đầu</p>
              <p className="mt-1">
                Hãy thêm hai biến BOOTSTRAP_ADMIN_EMAIL và BOOTSTRAP_ADMIN_PIN trong phần Variables and Secrets của Cloudflare, sau đó tải lại trang.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@weenglish.vn"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-pin">Mã PIN</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="login-pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="4–8 chữ số"
                    className="pl-9 tracking-[0.35em]"
                    minLength={4}
                    maxLength={8}
                    required
                  />
                </div>
              </div>
              {error ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
              ) : null}
              <Button type="submit" className="w-full bg-[#ff7a3d] hover:bg-[#e9652f]" disabled={submitting}>
                {submitting ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                Đăng nhập
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export function AccountManager() {
  const [users, setUsers] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AccountRow | null | undefined>(undefined);

  const load = async () => {
    try {
      const result = await authAction("listUsers");
      setUsers(result.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Loading remote account data after mount is the intended synchronization here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#d95c25]">Admin</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#102233] sm:text-3xl">Tài khoản đăng nhập</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Tạo email, cấp mã PIN, phân quyền hoặc tạm khóa tài khoản.
          </p>
        </div>
        <Button onClick={() => setEditing(null)}><Plus /> Thêm tài khoản</Button>
      </div>
      <Card className="border-0 shadow-[0_10px_30px_rgba(18,48,67,0.07)]">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground"><LoaderCircle className="mr-2 animate-spin" /> Đang tải tài khoản...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-24 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{roleLabels[user.role]}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}>
                        {user.active ? "Đang hoạt động" : "Đã khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditing(user)} aria-label={`Sửa ${user.name}`}><Pencil /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {editing !== undefined ? (
        <AccountEditor
          account={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            await load();
            setEditing(undefined);
          }}
        />
      ) : null}
    </div>
  );
}

function AccountEditor({
  account,
  onClose,
  onSaved,
}: {
  account: AccountRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const editing = Boolean(account);
  const [name, setName] = useState(account?.name || "");
  const [email, setEmail] = useState(account?.email || "");
  const [role, setRole] = useState<AuthRole>(account?.role || "academic_leader");
  const [pin, setPin] = useState("");
  const [active, setActive] = useState(Boolean(account?.active ?? 1));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await authAction(editing ? "updateUser" : "createUser", {
        ...(editing ? { id: account?.id } : {}),
        name,
        email,
        role,
        pin,
        active,
      });
      await onSaved();
      toast.success(editing ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu tài khoản.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}</DialogTitle>
          <DialogDescription>
            PIN phải gồm 4–8 chữ số. Khi chỉnh sửa, để trống PIN nếu không muốn thay đổi.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label htmlFor="account-name">Họ tên *</Label><Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="account-email">Email *</Label><Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="space-y-2">
            <Label>Vai trò *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AuthRole)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="academic_manager">Academic Manager</SelectItem>
                <SelectItem value="academic_leader">Academic Leader</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="account-pin">{editing ? "PIN mới" : "Mã PIN *"}</Label><Input id="account-pin" type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder={editing ? "Để trống nếu giữ PIN cũ" : "4–8 chữ số"} /></div>
          {editing ? (
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div><p className="text-sm font-semibold">Tài khoản hoạt động</p><p className="text-xs text-muted-foreground">Tắt để chặn đăng nhập mà không xóa dữ liệu.</p></div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save} disabled={saving || !name.trim() || !email.trim() || (!editing && pin.length < 4)}>
            {saving ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
            Lưu tài khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
