import { ensureSchema, sql } from "../../../db";

const studentView = (row: Record<string, unknown>) => ({
  id: row.id, name: row.name, className: row.class_name,
  currentLesson: row.current_lesson, currentStage: row.current_stage,
  completedCount: row.completed_count, lastActiveAt: row.last_active_at,
});

export async function GET(request: Request) {
  await ensureSchema();
  const id = new URL(request.url).searchParams.get("studentId") || "";
  if (!id) return Response.json({ error: "Aluno não identificado." }, { status: 400 });
  const students = await sql`SELECT * FROM students WHERE id=${id} LIMIT 1`;
  if (!students[0]) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
  const rows = await sql`SELECT lesson_slug AS "lessonSlug",answer,completed,updated_at AS "updatedAt" FROM progress WHERE student_id=${id}`;
  return Response.json({ student: studentView(students[0]), progress: rows });
}

export async function POST(request: Request) {
  await ensureSchema();
  const body = await request.json() as { studentId?: string; lessonSlug?: string; lessonNumber?: number; stage?: string; answer?: string; completed?: boolean };
  const studentId = body.studentId || "", lessonSlug = body.lessonSlug || "";
  if (!studentId || !lessonSlug) return Response.json({ error: "Dados incompletos." }, { status: 400 });
  const students = await sql`SELECT * FROM students WHERE id=${studentId} LIMIT 1`;
  if (!students[0]) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
  const current = await sql`SELECT * FROM progress WHERE student_id=${studentId} AND lesson_slug=${lessonSlug} LIMIT 1`;
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 20000) : String(current[0]?.answer || "");
  const completed = body.completed === true || current[0]?.completed === true;
  await sql`INSERT INTO progress (student_id,lesson_slug,answer,completed,updated_at)
    VALUES (${studentId},${lessonSlug},${answer},${completed},now())
    ON CONFLICT (student_id,lesson_slug) DO UPDATE SET answer=excluded.answer,completed=excluded.completed,updated_at=now()`;
  const count = await sql`SELECT count(*)::int AS total FROM progress WHERE student_id=${studentId} AND completed=true`;
  const lessonNumber = Math.max(1, Math.min(20, Number(body.lessonNumber) || Number(students[0].current_lesson)));
  const stage = String(body.stage || students[0].current_stage).slice(0, 30);
  await sql`UPDATE students SET current_lesson=${lessonNumber},current_stage=${stage},completed_count=${count[0].total},last_active_at=now() WHERE id=${studentId}`;
  return Response.json({ ok: true });
}
