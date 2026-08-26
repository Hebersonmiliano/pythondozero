import { changeTeacherPassword, teacherCookie, verifyTeacherPassword } from "./auth";

export async function POST(request: Request) {
  const body = await request.json() as { password?: string };
  const credential = await verifyTeacherPassword(body.password || "");
  if (!credential) return Response.json({ error: "Senha incorreta." }, { status: 401 });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": teacherCookie(credential) },
  });
}

export async function PUT(request: Request) {
  const body = await request.json() as { currentPassword?: string; newPassword?: string };
  const result = await changeTeacherPassword(body.currentPassword || "", body.newPassword || "");
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": teacherCookie(result.credential) },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": "professor_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" },
  });
}
