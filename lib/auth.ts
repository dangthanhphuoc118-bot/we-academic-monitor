import { env } from "cloudflare:workers";
import { and, count, eq, gt, gte, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { authLoginAttempts, authSessions, authUsers } from "@/db/schema";

export const AUTH_COOKIE = "we_academic_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

export const authRoles = [
  "admin",
  "academic_manager",
  "academic_leader",
] as const;

export type AuthRole = (typeof authRoles)[number];

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
};

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string) {
  const bytes = new Uint8Array(Math.floor(value.length / 2));
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function randomHex(length: number) {
  return toHex(crypto.getRandomValues(new Uint8Array(length)));
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function validPin(value: string) {
  return /^\d{4,8}$/.test(value);
}

export function isAuthRole(value: string): value is AuthRole {
  return authRoles.includes(value as AuthRole);
}

export async function hashPin(pin: string, salt = randomHex(16)) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(salt),
      iterations: 100_000,
    },
    key,
    256
  );
  return { hash: toHex(hash), salt };
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyPin(pin: string, salt: string, expectedHash: string) {
  const { hash } = await hashPin(pin, salt);
  return constantTimeEqual(hash, expectedHash);
}

function requestCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function safeUser(row: { id: number; name: string; email: string; role: string }): AuthUser | null {
  if (!isAuthRole(row.role)) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export async function ensureBootstrapAdmin() {
  const db = getDb();
  const [row] = await db.select({ total: count() }).from(authUsers);
  if (Number(row.total) > 0) return { ready: true, created: false };

  const email = normalizeEmail(env.BOOTSTRAP_ADMIN_EMAIL || "");
  const pin = (env.BOOTSTRAP_ADMIN_PIN || "").trim();
  if (!validEmail(email) || !validPin(pin)) {
    return { ready: false, created: false };
  }

  const { hash, salt } = await hashPin(pin);
  await db
    .insert(authUsers)
    .values({
      name: "Administrator",
      email,
      pinHash: hash,
      pinSalt: salt,
      role: "admin",
      active: 1,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: authUsers.email });

  return { ready: true, created: true };
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  await ensureBootstrapAdmin();
  const sessionId = requestCookie(request, AUTH_COOKIE);
  if (!sessionId) return null;

  const db = getDb();
  const timestamp = new Date().toISOString();
  const [row] = await db
    .select({
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
      role: authUsers.role,
      active: authUsers.active,
    })
    .from(authSessions)
    .innerJoin(authUsers, eq(authSessions.userId, authUsers.id))
    .where(and(eq(authSessions.id, sessionId), gt(authSessions.expiresAt, timestamp)))
    .limit(1);

  if (!row || !row.active) return null;
  return safeUser(row);
}

export async function createSession(userId: number) {
  const db = getDb();
  const id = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await db.insert(authSessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

export async function deleteCurrentSession(request: Request) {
  const sessionId = requestCookie(request, AUTH_COOKIE);
  if (sessionId) {
    await getDb().delete(authSessions).where(eq(authSessions.id, sessionId));
  }
}

export function sessionCookie(value: string, maxAge = SESSION_SECONDS) {
  return `${AUTH_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function isLoginBlocked(email: string, ipAddress: string) {
  const db = getDb();
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  await db.delete(authLoginAttempts).where(lt(authLoginAttempts.attemptedAt, cutoff));
  const [row] = await db
    .select({ total: count() })
    .from(authLoginAttempts)
    .where(
      and(
        eq(authLoginAttempts.email, normalizeEmail(email)),
        eq(authLoginAttempts.ipAddress, ipAddress),
        gte(authLoginAttempts.attemptedAt, cutoff)
      )
    );
  return Number(row.total) >= 5;
}

export async function recordFailedLogin(email: string, ipAddress: string) {
  await getDb().insert(authLoginAttempts).values({
    email: normalizeEmail(email),
    ipAddress,
    attemptedAt: new Date().toISOString(),
  });
}

export async function clearLoginAttempts(email: string, ipAddress: string) {
  await getDb()
    .delete(authLoginAttempts)
    .where(
      and(
        eq(authLoginAttempts.email, normalizeEmail(email)),
        eq(authLoginAttempts.ipAddress, ipAddress)
      )
    );
}

export async function countActiveAdmins() {
  const [row] = await getDb()
    .select({ total: count() })
    .from(authUsers)
    .where(and(eq(authUsers.role, "admin"), eq(authUsers.active, 1)));
  return Number(row.total);
}
