import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ensureSchema, sql } from "../../../db";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function matchesHash(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const calculated = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return calculated.length === expected.length && timingSafeEqual(calculated, expected);
}

async function storedHash() {
  await ensureSchema();
  const rows = await sql`SELECT password_hash FROM teacher_settings WHERE id=1`;
  return rows[0]?.password_hash as string | undefined;
}

export async function verifyTeacherPassword(password: string) {
  const stored = await storedHash();
  if (stored) return matchesHash(password, stored) ? stored : null;
  const initial = process.env.PROFESSOR_PASSWORD || "";
  if (initial.length < 8 || password !== initial) return null;
  return initial;
}

export async function changeTeacherPassword(current: string, next: string) {
  const credential = await verifyTeacherPassword(current);
  if (!credential) return { error: "A senha atual está incorreta." };
  if (next.length < 10 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/\d/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
    return { error: "Use pelo menos 10 caracteres, com maiúscula, minúscula, número e símbolo." };
  }
  if (current === next) return { error: "A nova senha deve ser diferente da senha atual." };
  const passwordHash = hashPassword(next);
  await sql`INSERT INTO teacher_settings (id,password_hash,updated_at) VALUES (1,${passwordHash},now())
    ON CONFLICT (id) DO UPDATE SET password_hash=excluded.password_hash,updated_at=now()`;
  return { credential: passwordHash };
}

export async function teacherRequestIsAuthorized(request: Request) {
  const cookie = request.headers.get("cookie")?.match(/(?:^|; )professor_session=([^;]+)/)?.[1] || "";
  const credential = await storedHash() || process.env.PROFESSOR_PASSWORD || "";
  return credential.length >= 8 && cookie === teacherSessionToken(credential);
}

export function teacherSessionToken(credential: string) {
  return createHash("sha256").update(`python-do-zero-session:${credential}`).digest("hex");
}

export function teacherCookie(credential: string) {
  return `professor_session=${teacherSessionToken(credential)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
