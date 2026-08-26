import { ensureSchema, sql } from "../../../db";
import { teacherRequestIsAuthorized } from "../professor/auth";
import { authenticatedStudent } from "../students/auth";

const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";

export async function GET(request:Request){
 await ensureSchema();
 const url=new URL(request.url),studentId=url.searchParams.get("studentId")||"";
 if(await teacherRequestIsAuthorized(request)){
  const rows=await sql`SELECT id,class_name AS "className",kind,title,content,due_date AS "dueDate",created_at AS "createdAt" FROM classroom_posts ORDER BY created_at DESC`;
  return Response.json({posts:rows});
 }
 if(!studentId)return Response.json({error:"Aluno não identificado."},{status:401});
 const student=await authenticatedStudent(request,studentId);
 if(!student)return Response.json({error:"Sessão inválida."},{status:401});
 const rows=await sql`SELECT id,class_name AS "className",kind,title,content,due_date AS "dueDate",created_at AS "createdAt" FROM classroom_posts WHERE class_name=${student.class_name} OR class_name='Todas' ORDER BY created_at DESC`;
 return Response.json({posts:rows});
}

export async function POST(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();
 const body=await request.json() as {className?:string;kind?:string;title?:string;content?:string;dueDate?:string};
 const className=clean(body.className,60),kind=body.kind==="Atividade"?"Atividade":"Recado",title=clean(body.title,120),content=clean(body.content,2000);
 if(!className||title.length<3||content.length<3)return Response.json({error:"Preencha turma, título e conteúdo."},{status:400});
 const dueDate=body.dueDate&&/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)?body.dueDate:null;
 const rows=await sql`INSERT INTO classroom_posts (class_name,kind,title,content,due_date) VALUES (${className},${kind},${title},${content},${dueDate}) RETURNING id`;
 return Response.json({ok:true,id:rows[0].id});
}

export async function DELETE(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();const id=new URL(request.url).searchParams.get("id")||"";
 if(!id)return Response.json({error:"Publicação inválida."},{status:400});
 await sql`DELETE FROM classroom_posts WHERE id=${id}`;return Response.json({ok:true});
}