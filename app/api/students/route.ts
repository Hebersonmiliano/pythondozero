import { ensureSchema, sql } from "../../../db";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
const studentView = (row: Record<string, unknown>) => ({
  id: row.id, name: row.name, className: row.class_name,
  currentLesson: row.current_lesson, currentStage: row.current_stage,
  completedCount: row.completed_count, lastActiveAt: row.last_active_at,
  createdAt: row.created_at,
});

export async function POST(request: Request) {
  await ensureSchema();
  const body = await request.json() as { name?: string; className?: string };
  const name = clean(body.name, 80), className = clean(body.className, 60);
  if (name.length < 2 || className.length < 2) return Response.json({ error: "Informe nome e turma." }, { status: 400 });
  const existing = await sql`SELECT * FROM students WHERE lower(name)=lower(${name}) AND lower(class_name)=lower(${className}) LIMIT 1`;
  if (existing[0]) return Response.json({ student: studentView(existing[0]) });
  const id = crypto.randomUUID();
  const rows = await sql`INSERT INTO students (id,name,class_name) VALUES (${id},${name},${className}) RETURNING *`;
  return Response.json({ student: studentView(rows[0]) }, { status: 201 });
}

export async function GET(request: Request) {
  if (!isTeacher(request)) return Response.json({ error: "Acesso negado." }, { status: 401 });
  await ensureSchema();
  const rows = await sql`SELECT * FROM students ORDER BY class_name,name`;
  return Response.json({ students: rows.map(studentView) });
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
