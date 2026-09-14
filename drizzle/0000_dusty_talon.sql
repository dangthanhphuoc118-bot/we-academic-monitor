CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`schedule` text DEFAULT '' NOT NULL,
	`room` text DEFAULT '' NOT NULL,
	`teacher_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_classes_name_unique` ON `classes` (`name`);--> statement-breakpoint
CREATE INDEX `idx_classes_teacher_id` ON `classes` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_classes_status` ON `classes` (`status`);--> statement-breakpoint
CREATE TABLE `criteria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_type` text NOT NULL,
	`level` text DEFAULT 'ALL' NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_criteria_target_level_active` ON `criteria` (`target_type`,`level`,`active`);--> statement-breakpoint
CREATE TABLE `student_assessment_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`criterion_id` integer NOT NULL,
	`score` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `student_assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`criterion_id`) REFERENCES `criteria`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_student_items_assessment_id` ON `student_assessment_items` (`assessment_id`);--> statement-breakpoint
CREATE TABLE `student_assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`class_id` integer,
	`evaluator_name` text NOT NULL,
	`overall_score` real NOT NULL,
	`result` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`action_plan` text DEFAULT '' NOT NULL,
	`checked_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_student_assessments_student_date` ON `student_assessments` (`student_id`,`checked_at`);--> statement-breakpoint
CREATE INDEX `idx_student_assessments_result` ON `student_assessments` (`result`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`class_id` integer,
	`level` text NOT NULL,
	`guardian_phone` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_students_class_id` ON `students` (`class_id`);--> statement-breakpoint
CREATE INDEX `idx_students_level_status` ON `students` (`level`,`status`);--> statement-breakpoint
CREATE TABLE `teacher_review_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`review_id` integer NOT NULL,
	`criterion_id` integer NOT NULL,
	`score` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `teacher_reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`criterion_id`) REFERENCES `criteria`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_teacher_items_review_id` ON `teacher_review_items` (`review_id`);--> statement-breakpoint
CREATE TABLE `teacher_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`reviewer_name` text NOT NULL,
	`overall_score` real NOT NULL,
	`result` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`action_plan` text DEFAULT '' NOT NULL,
	`observed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_teacher_reviews_teacher_date` ON `teacher_reviews` (`teacher_id`,`observed_at`);--> statement-breakpoint
CREATE INDEX `idx_teacher_reviews_result` ON `teacher_reviews` (`result`);--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`specialization` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_teachers_status` ON `teachers` (`status`);