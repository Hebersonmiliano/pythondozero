import { createHash, randomInt, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ensureSchema, sql } from "../../../db";

export function hashPin(pin:string){
 const salt=randomBytes(16).toString("hex");
 return `${salt}:${scryptSync(pin,salt,64).toString("hex")}`;
}
export function verifyPin(pin:string,stored:string){
 const [salt,hash]=stored.split(":"); if(!salt||!hash)return false;
 const actual=scryptSync(pin,salt,64),expected=Buffer.from(hash,"hex");
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export function generatePin(){return String(randomInt(100000,1000000))}
function token(id:string,pinHash:string){
 const secret=process.env.PROFESSOR_PASSWORD||"";
 return createHash("sha256").update(`student:${id}:${pinHash}:${secret}`).digest("hex");
}
export function studentCookie(id:string,pinHash:string){
 return `student_session=${id}.${token(id,pinHash)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
export async function authenticatedStudent(request:Request,expectedId?:string){
 await ensureSchema();
 const raw=request.headers.get("cookie")?.match(/(?:^|; )student_session=([^;]+)/)?.[1]||"";
 const dot=raw.indexOf("."); if(dot<1)return null;
 const id=raw.slice(0,dot),provided=raw.slice(dot+1); if(expectedId&&id!==expectedId)return null;
 const rows=await sql`SELECT * FROM students WHERE id=${id} LIMIT 1`; const row=rows[0];
 if(!row?.pin_hash)return null;
 const expected=token(id,String(row.pin_hash));
 const a=Buffer.from(provided),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b)?row:null;
}
