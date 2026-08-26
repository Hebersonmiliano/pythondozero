import { ensureSchema, sql } from "../../../db";
import { authenticatedStudent } from "../students/auth";

const studentView=(row:Record<string,unknown>)=>({id:row.id,name:row.name,className:row.class_name,currentLesson:row.current_lesson,currentStage:row.current_stage,completedCount:row.completed_count,lastActiveAt:row.last_active_at});

export async function GET(request:Request){
 await ensureSchema();const id=new URL(request.url).searchParams.get("studentId")||"";
 if(!id)return Response.json({error:"Aluno não identificado."},{status:400});
 const student=await authenticatedStudent(request,id);
 if(!student)return Response.json({error:"Sessão do aluno inválida. Entre novamente."},{status:401});
 const rows=await sql`SELECT lesson_slug AS "lessonSlug",answer,completed,review_status AS "reviewStatus",teacher_feedback AS "teacherFeedback",submitted_at AS "submittedAt",updated_at AS "updatedAt" FROM progress WHERE student_id=${id}`;
 return Response.json({student:studentView(student),progress:rows});
}

export async function POST(request:Request){
 await ensureSchema();
 const body=await request.json() as {studentId?:string;lessonSlug?:string;lessonNumber?:number;stage?:string;answer?:string;completed?:boolean;submit?:boolean};
 const studentId=body.studentId||"",lessonSlug=body.lessonSlug||"";
 if(!studentId||!lessonSlug)return Response.json({error:"Dados incompletos."},{status:400});
 const student=await authenticatedStudent(request,studentId);
 if(!student)return Response.json({error:"Sessão do aluno inválida. Entre novamente."},{status:401});
 const current=await sql`SELECT * FROM progress WHERE student_id=${studentId} AND lesson_slug=${lessonSlug} LIMIT 1`;
 const answer=typeof body.answer==="string"?body.answer.slice(0,20000):String(current[0]?.answer||"");
 const completed=body.completed===true||current[0]?.completed===true;
 const status=body.submit?"entregue":String(current[0]?.review_status||"rascunho");
 await sql`INSERT INTO progress (student_id,lesson_slug,answer,completed,review_status,submitted_at,updated_at) VALUES (${studentId},${lessonSlug},${answer},${completed},${status},${body.submit?new Date():current[0]?.submitted_at||null},now())
 ON CONFLICT (student_id,lesson_slug) DO UPDATE SET answer=excluded.answer,completed=excluded.completed,review_status=excluded.review_status,submitted_at=excluded.submitted_at,updated_at=now()`;
 const count=await sql`SELECT count(*)::int AS total FROM progress WHERE student_id=${studentId} AND completed=true AND lesson_slug NOT LIKE 'logica-%'`;
 const lessonNumber=Math.max(1,Math.min(20,Number(body.lessonNumber)||Number(student.current_lesson)));
 const stage=String(body.submit?"Entregue":body.stage||student.current_stage).slice(0,30);
 if(lessonSlug.startsWith("logica-"))await sql`UPDATE students SET current_stage=${stage},last_active_at=now() WHERE id=${studentId}`;
 else await sql`UPDATE students SET current_lesson=${lessonNumber},current_stage=${stage},completed_count=${count[0].total},last_active_at=now() WHERE id=${studentId}`;
 return Response.json({ok:true,reviewStatus:status});
}