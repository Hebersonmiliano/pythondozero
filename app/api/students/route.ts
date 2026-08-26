import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { students } from "../../../db/schema";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

export async function POST(request: Request) {
  const body = await request.json() as { name?: string; className?: string };
  const name = clean(body.name, 80), className = clean(body.className, 60);
  if (name.length < 2 || className.length < 2) return Response.json({ error: "Informe nome e turma." }, { status: 400 });
  const db = getDb();
  const [existing] = await db.select().from(students).where(and(eq(students.name, name), eq(students.className, className))).limit(1);
  if (existing) return Response.json({ student: existing });
  const id = crypto.randomUUID();
  const [student] = await db.insert(students).values({ id, name, className }).returning();
  return Response.json({ student }, { status: 201 });
}

export async function GET(request: Request) {
  if (!isTeacher(request)) return Response.json({ error: "Acesso negado." }, { status: 401 });
  const db = getDb();
  const rows = await db.select().from(students).orderBy(asc(students.className), asc(students.name));
  return Response.json({ students: rows });
}

function isTeacher(request: Request) {
  const password = process.env.PROFESSOR_PASSWORD || "";
  const cookie = request.headers.get("cookie")?.match(/(?:^|; )professor_session=([^;]+)/)?.[1] || "";
  return password.length >= 8 && cookie === teacherToken(password);
}

export function teacherToken(password: string) {
  let hash = 2166136261;
  for (const char of `python-do-zero:${password}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}
