import { teacherToken } from "../students/route";

export async function POST(request: Request) {
  const body = await request.json() as { password?: string };
  const configured = process.env.PROFESSOR_PASSWORD || "";
  if (configured.length < 8) return Response.json({ error: "Senha do professor ainda não configurada." }, { status: 503 });
  if (body.password !== configured) return Response.json({ error: "Senha incorreta." }, { status: 401 });
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": `professor_session=${teacherToken(configured)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800` } });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": "professor_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0" } });
}
