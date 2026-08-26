import { ensureSchema, sql } from "../../../../db";
import { teacherRequestIsAuthorized } from "../../professor/auth";
import { generatePin, hashPin } from "../auth";

const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().replace(/\s+/g," ").slice(0,max):"";

export async function POST(request:Request){
 if(!await teacherRequestIsAuthorized(request))return Response.json({error:"Acesso negado."},{status:401});
 await ensureSchema();
 const body=await request.json() as {name?:string;className?:string;studentId?:string};
 const pin=generatePin(),pinHash=hashPin(pin);
 if(body.studentId){
  const rows=await sql`UPDATE students SET pin_hash=${pinHash},failed_attempts=0,locked_until=null WHERE id=${body.studentId} RETURNING id,name,class_name`;
  if(!rows[0])return Response.json({error:"Aluno não encontrado."},{status:404});
  return Response.json({student:{id:rows[0].id,name:rows[0].name,className:rows[0].class_name},pin});
 }
 const name=clean(body.name,80),className=clean(body.className,60);
 if(name.length<2||className.length<2)return Response.json({error:"Informe nome e turma."},{status:400});
 const existing=await sql`SELECT * FROM students WHERE lower(name)=lower(${name}) AND lower(class_name)=lower(${className}) LIMIT 1`;
 if(existing[0]){
  await sql`UPDATE students SET pin_hash=${pinHash},failed_attempts=0,locked_until=null WHERE id=${existing[0].id}`;
  return Response.json({student:{id:existing[0].id,name:existing[0].name,className:existing[0].class_name},pin,reset:true});
 }
 const id=crypto.randomUUID();
 const rows=await sql`INSERT INTO students (id,name,class_name,pin_hash) VALUES (${id},${name},${className},${pinHash}) RETURNING *`;
 return Response.json({student:{id:rows[0].id,name:rows[0].name,className:rows[0].class_name},pin},{status:201});
}
