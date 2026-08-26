import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { progress, students } from "../../../db/schema";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("studentId") || "";
  if (!id) return Response.json({ error: "Aluno não identificado." }, { status: 400 });
  const db = getDb();
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!student) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
  const rows = await db.select().from(progress).where(eq(progress.studentId, id));
  return Response.json({ student, progress: rows });
}

export async function POST(request: Request) {
  const body = await request.json() as { studentId?: string; lessonSlug?: string; lessonNumber?: number; stage?: string; answer?: string; completed?: boolean };
  const studentId = body.studentId || "", lessonSlug = body.lessonSlug || "";
  if (!studentId || !lessonSlug) return Response.json({ error: "Dados incompletos." }, { status: 400 });
  const db = getDb();
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
  const current = await db.select().from(progress).where(and(eq(progress.studentId, studentId), eq(progress.lessonSlug, lessonSlug))).limit(1);
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 20000) : current[0]?.answer || "";
  const completed = body.completed === true || current[0]?.completed === true;
  await db.insert(progress).values({ studentId, lessonSlug, answer, completed, updatedAt: sql`CURRENT_TIMESTAMP` })
    .onConflictDoUpdate({ target: [progress.studentId, progress.lessonSlug], set: { answer, completed, updatedAt: sql`CURRENT_TIMESTAMP` } });
  const completedRows = await db.select({ count: sql<number>`count(*)` }).from(progress).where(and(eq(progress.studentId, studentId), eq(progress.completed, true)));
  await db.update(students).set({ currentLesson: Math.max(1, Math.min(20, Number(body.lessonNumber) || student.currentLesson)), currentStage: (body.stage || student.currentStage).slice(0, 30), completedCount: Number(completedRows[0]?.count || 0), lastActiveAt: sql`CURRENT_TIMESTAMP` }).where(eq(students.id, studentId));
  return Response.json({ ok: true });
}
