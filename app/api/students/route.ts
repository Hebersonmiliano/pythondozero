import { ensureSchema, sql } from "../../../db";
import { teacherRequestIsAuthorized } from "../professor/auth";
import { studentCookie, verifyPin } from "./auth";

const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().replace(/\s+/g," ").slice(0,max):"";
const studentView=(row:Record<string,unknown>)=>({
 id:row.id,name:row.name,className:row.class_name,currentLesson:row.current_lesson,currentStage:row.current_stage,
 completedCount:row.completed_count,lastActiveAt:row.last_active_at,createdAt:row.created_at,hasPin:Boolean(row.pin_hash),
});

export async function POST(request:Request){
 await ensureSchema();
 const body=await request.json() as {name?:string;className?:string;pin?:string};
 const name=clean(body.name,80),className=clean(body.className,60),pin=String(body.pin||"");
 if(name.length<2||className.length<2||!/^[0-9]{6}$/.test(pin))return Response.json({error:"Informe nome, turma e PIN de 6 números."},{status:400});
 const rows=await sql`SELECT * FROM students WHERE lower(name)=lower(${name}) AND lower(class_name)=lower(${className}) LIMIT 1`;
 const student=rows[0];
 if(!student)return Response.json({error:"Nome, turma ou PIN incorreto."},{status:401});
 if(!student.pin_hash)return Response.json({error:"Seu PIN ainda não foi criado. Peça ao professor."},{status:403});
 if(student.locked_until&&new Date(student.locked_until as string)>new Date())return Response.json({error:"Acesso bloqueado por 15 minutos após várias tentativas."},{status:429});
 if(!verifyPin(pin,String(student.pin_hash))){
  const attempts=Number(student.failed_attempts||0)+1;
  if(attempts>=5)await sql`UPDATE students SET failed_attempts=0,locked_until=now()+interval '15 minutes' WHERE id=${student.id}`;
  else await sql`UPDATE students SET failed_attempts=${attempts} WHERE id=${student.id}`;
  return Response.json({error:attempts>=5?"Acesso bloqueado por 15 minutos.":"Nome, turma ou PIN incorreto."},{status:401});
 }
 await sql`UPDATE students SET failed_attempts=0,locked_until=null,last_active_at=now() WHERE id=${student.id}`;
 return new Response(JSON.stringify({student:studentView(student)}),{headers:{"content-type":"application/json","set-cookie":studentCookie(String(student.id),String(student.pin_hash))}});
}

export async function GET(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();const rows=await sql`SELECT * FROM students ORDER BY class_name,name`;
 return Response.json({students:rows.map(studentView)});
}

export async function DELETE(){
 return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"student_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"}});
}
