CREATE TABLE `curriculum_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_code` text NOT NULL,
	`unit_number` integer NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`vocabulary` text DEFAULT '' NOT NULL,
	`grammar` text DEFAULT '' NOT NULL,
	`vocabulary_max` integer DEFAULT 0 NOT NULL,
	`writing_ref` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_curriculum_overrides_program_unit` ON `curriculum_overrides` (`program_code`,`unit_number`);--> statement-breakpoint
CREATE TABLE `learning_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`class_id` integer,
	`program_code` text NOT NULL,
	`program_label` text NOT NULL,
	`unit_number` integer NOT NULL,
	`unit_label` text NOT NULL,
	`teacher_name` text NOT NULL,
	`checked_at` text NOT NULL,
	`evaluation_json` text NOT NULL,
	`overall_score` real NOT NULL,
	`result` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`action_plan` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_learning_checks_student_date` ON `learning_checks` (`student_id`,`checked_at`);--> statement-breakpoint
CREATE INDEX `idx_learning_checks_program_date` ON `learning_checks` (`program_code`,`checked_at`);--> statement-breakpoint
CREATE INDEX `idx_learning_checks_result` ON `learning_checks` (`result`);--> statement-breakpoint
PRAGMA optimize;
