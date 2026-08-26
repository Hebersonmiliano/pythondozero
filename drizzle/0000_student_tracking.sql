CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`class_name` text NOT NULL,
	`current_lesson` integer DEFAULT 1 NOT NULL,
	`current_stage` text DEFAULT 'Entenda' NOT NULL,
	`completed_count` integer DEFAULT 0 NOT NULL,
	`last_active_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`student_id` text NOT NULL,
	`lesson_slug` text NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`student_id`, `lesson_slug`),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_students_class_name` ON `students` (`class_name`);
--> statement-breakpoint
CREATE INDEX `idx_progress_student_id` ON `progress` (`student_id`);
