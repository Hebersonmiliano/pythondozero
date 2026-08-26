import {ensureSchema,sql} from "../../../db";
import {teacherRequestIsAuthorized} from "../professor/auth";

export async function GET(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();const url=new URL(request.url),className=url.searchParams.get("className")||"Todas",status=url.searchParams.get("status")||"Todos";
 const rows=await sql`SELECT p.student_id AS "studentId",s.name,s.class_name AS "className",p.lesson_slug AS "lessonSlug",p.answer,p.review_status AS "reviewStatus",p.teacher_feedback AS "teacherFeedback",p.submitted_at AS "submittedAt",p.updated_at AS "updatedAt" FROM progress p JOIN students s ON s.id=p.student_id WHERE length(p.answer)>0 AND (${className}='Todas' OR s.class_name=${className}) AND (${status}='Todos' OR p.review_status=${status}) ORDER BY COALESCE(p.submitted_at,p.updated_at) DESC`;
 return Response.json({reviews:rows});
}
export async function PUT(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();const body=await request.json() as {studentId?:string;lessonSlug?:string;status?:string;feedback?:string};
 const allowed=["entregue","corrigida","refazer"];if(!body.studentId||!body.lessonSlug||!allowed.includes(body.status||""))return Response.json({error:"Dados inválidos."},{status:400});
 await sql`UPDATE progress SET review_status=${body.status!},teacher_feedback=${String(body.feedback||"").slice(0,2000)},updated_at=now() WHERE student_id=${body.studentId} AND lesson_slug=${body.lessonSlug}`;
 return Response.json({ok:true});
}