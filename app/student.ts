export type Student = { id:string; name:string; className:string; currentLesson:number; currentStage:string; completedCount:number };
export type Progress = { lessonSlug:string; answer:string; completed:boolean; reviewStatus:string; teacherFeedback:string; submittedAt:string|null };
export const studentKey = "python-do-zero-student";
export function savedStudent(): Student | null { try { return JSON.parse(localStorage.getItem(studentKey) || "null") } catch { return null } }
export function rememberStudent(student: Student) { localStorage.setItem(studentKey, JSON.stringify(student)); }
export async function loadProgress(studentId:string) { const response=await fetch(`/api/progress?studentId=${encodeURIComponent(studentId)}`); if(!response.ok) throw new Error("Não foi possível carregar o progresso."); return response.json() as Promise<{student:Student;progress:Progress[]}>; }
export async function saveProgress(payload:Record<string,unknown>) { const response=await fetch("/api/progress",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}); if(!response.ok) throw new Error("Não foi possível salvar."); }
