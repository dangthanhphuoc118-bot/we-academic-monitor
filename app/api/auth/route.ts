import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { authSessions, authUsers } from "@/db/schema";
import {
  clearLoginAttempts,
  clientIp,
  countActiveAdmins,
  createSession,
  deleteCurrentSession,
  ensureBootstrapAdmin,
  getCurrentUser,
  hashPin,
  isAuthRole,
  isLoginBlocked,
  recordFailedLogin,
  sessionCookie,
  validEmail,
  validPin,
  verifyPin,
} from "@/lib/auth";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const normalizeEmail = (value: unknown) => clean(value).toLowerCase();

function fail(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function numericId(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
  if (message.includes("no such table")) {
    return "Bảng đăng nhập chưa được tạo. Hãy kiểm tra migration 0003 và xuất bản lại website.";
  }
  if (message.includes("UNIQUE constraint failed")) {
    return "Email này đã được sử dụng cho một tài khoản khác.";
  }
  return message;
}

export async function GET(request: Request) {
  try {
    const setup = await ensureBootstrapAdmin();
    const user = await getCurrentUser(request);
    return Response.json({ user, setupRequired: !setup.ready });
  } catch (error) {
    return fail(errorMessage(error), 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = clean(body.action);
    const db = getDb();

    if (action === "login") {
      const setup = await ensureBootstrapAdmin();
      if (!setup.ready) {
        return fail(
          "Chưa cấu hình tài khoản Admin ban đầu. Hãy thêm BOOTSTRAP_ADMIN_EMAIL và BOOTSTRAP_ADMIN_PIN trong Cloudflare.",
          503
        );
      }

      const email = normalizeEmail(body.email);
      const pin = clean(body.pin);
      const ipAddress = clientIp(request);
      if (!validEmail(email) || !validPin(pin)) {
        return fail("Email hoặc mã PIN không đúng.", 401);
      }
      if (await isLoginBlocked(email, ipAddress)) {
        return fail("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.", 429);
      }

      const [row] = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email))
        .limit(1);
      const valid = Boolean(
        row && row.active && (await verifyPin(pin, row.pinSalt, row.pinHash))
      );
      if (!row || !valid || !isAuthRole(row.role)) {
        await recordFailedLogin(email, ipAddress);
        return fail("Email hoặc mã PIN không đúng.", 401);
      }

      await clearLoginAttempts(email, ipAddress);
      const session = await createSession(row.id);
      return Response.json(
        {
          user: { id: row.id, name: row.name, email: row.email, role: row.role },
        },
        { headers: { "Set-Cookie": sessionCookie(session.id) } }
      );
    }

    if (action === "logout") {
      await deleteCurrentSession(request);
      return Response.json(
        { ok: true },
        { headers: { "Set-Cookie": sessionCookie("", 0) } }
      );
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) return fail("Phiên đăng nhập đã hết hạn.", 401);
    if (currentUser.role !== "admin") {
      return fail("Chỉ Admin được quản lý tài khoản đăng nhập.", 403);
    }

    if (action === "listUsers") {
      const users = await db
        .select({
          id: authUsers.id,
          name: authUsers.name,
          email: authUsers.email,
          role: authUsers.role,
          active: authUsers.active,
          createdAt: authUsers.createdAt,
          updatedAt: authUsers.updatedAt,
        })
        .from(authUsers)
        .orderBy(asc(authUsers.role), asc(authUsers.name));
      return Response.json({ users });
    }

    if (action === "createUser") {
      const name = clean(body.name);
      const email = normalizeEmail(body.email);
      const role = clean(body.role);
      const pin = clean(body.pin);
      if (!name || !validEmail(email) || !isAuthRole(role) || !validPin(pin)) {
        return fail("Vui lòng nhập tên, email hợp lệ, vai trò và PIN gồm 4–8 chữ số.");
      }
      const { hash, salt } = await hashPin(pin);
      const [row] = await db
        .insert(authUsers)
        .values({
          name,
          email,
          role,
          pinHash: hash,
          pinSalt: salt,
          active: 1,
          updatedAt: new Date().toISOString(),
        })
        .returning({
          id: authUsers.id,
          name: authUsers.name,
          email: authUsers.email,
          role: authUsers.role,
          active: authUsers.active,
          createdAt: authUsers.createdAt,
          updatedAt: authUsers.updatedAt,
        });
      return Response.json({ user: row }, { status: 201 });
    }

    if (action === "updateUser") {
      const userId = numericId(body.id);
      if (!userId) return fail("Tài khoản không hợp lệ.");
      const [existing] = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.id, userId))
        .limit(1);
      if (!existing) return fail("Không tìm thấy tài khoản.", 404);

      const name = clean(body.name);
      const email = normalizeEmail(body.email);
      const role = clean(body.role);
      const pin = clean(body.pin);
      const active = body.active === false || body.active === 0 ? 0 : 1;
      if (!name || !validEmail(email) || !isAuthRole(role)) {
        return fail("Vui lòng nhập tên, email và vai trò hợp lệ.");
      }
      if (pin && !validPin(pin)) {
        return fail("Mã PIN mới phải gồm 4–8 chữ số.");
      }
      if (currentUser.id === userId && (role !== "admin" || !active)) {
        return fail("Bạn không thể tự bỏ quyền Admin hoặc tự khóa tài khoản đang dùng.", 409);
      }
      if (
        existing.role === "admin" &&
        existing.active &&
        (role !== "admin" || !active) &&
        (await countActiveAdmins()) <= 1
      ) {
        return fail("Hệ thống phải còn ít nhất một tài khoản Admin đang hoạt động.", 409);
      }

      const values: {
        name: string;
        email: string;
        role: typeof role;
        active: number;
        updatedAt: string;
        pinHash?: string;
        pinSalt?: string;
      } = {
        name,
        email,
        role,
        active,
        updatedAt: new Date().toISOString(),
      };
      if (pin) {
        const { hash, salt } = await hashPin(pin);
        values.pinHash = hash;
        values.pinSalt = salt;
      }

      await db.update(authUsers).set(values).where(eq(authUsers.id, userId));
      if (currentUser.id !== userId && (!active || pin || existing.role !== role)) {
        await db.delete(authSessions).where(eq(authSessions.userId, userId));
      }
      const [row] = await db
        .select({
          id: authUsers.id,
          name: authUsers.name,
          email: authUsers.email,
          role: authUsers.role,
          active: authUsers.active,
          createdAt: authUsers.createdAt,
          updatedAt: authUsers.updatedAt,
        })
        .from(authUsers)
        .where(and(eq(authUsers.id, userId), eq(authUsers.email, email)))
        .limit(1);
      return Response.json({ user: row });
    }

    return fail("Tác vụ không được hỗ trợ.", 404);
  } catch (error) {
    return fail(errorMessage(error), 500);
  }
}
