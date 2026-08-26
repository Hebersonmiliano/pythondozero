import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");

export const sql = postgres(connectionString, { ssl: "require", max: 5 });

let schemaReady: Promise<void> | null = null;
export function ensureSchema() {
  schemaReady ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS students (
      id text PRIMARY KEY,
      name text NOT NULL,
      class_name text NOT NULL,
      current_lesson integer NOT NULL DEFAULT 1,
      current_stage text NOT NULL DEFAULT 'Entenda',
      completed_count integer NOT NULL DEFAULT 0,
      last_active_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_hash text`;
    await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS locked_until timestamptz`;
    await sql`CREATE TABLE IF NOT EXISTS progress (
      student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      lesson_slug text NOT NULL,
      answer text NOT NULL DEFAULT '',
      completed boolean NOT NULL DEFAULT false,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (student_id, lesson_slug)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS classroom_posts (
      id bigserial PRIMARY KEY,
      class_name text NOT NULL,
      kind text NOT NULL CHECK (kind IN ('Recado','Atividade')),
      title text NOT NULL,
      content text NOT NULL,
      due_date date,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_classroom_posts_class ON classroom_posts(class_name,created_at DESC)`;
    await sql`CREATE TABLE IF NOT EXISTS teacher_settings (
      id integer PRIMARY KEY CHECK (id = 1),
      password_hash text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id)`;
  })();
  return schemaReady;
}
