import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  currentLesson: integer("current_lesson").notNull().default(1),
  currentStage: text("current_stage").notNull().default("Entenda"),
  completedCount: integer("completed_count").notNull().default(0),
  lastActiveAt: text("last_active_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_students_class_name").on(table.className)]);

export const progress = sqliteTable("progress", {
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  lessonSlug: text("lesson_slug").notNull(),
  answer: text("answer").notNull().default(""),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.studentId, table.lessonSlug] }), index("idx_progress_student_id").on(table.studentId)]);
