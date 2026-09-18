CREATE TABLE `student_tracking` (
	`student_id` integer PRIMARY KEY NOT NULL,
	`start_date` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teacher_observations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer,
	`teacher_name` text NOT NULL,
	`teacher_role` text DEFAULT 'teacher' NOT NULL,
	`class_id` integer,
	`class_name` text NOT NULL,
	`observer_name` text NOT NULL,
	`observed_at` text NOT NULL,
	`observed_time` text NOT NULL,
	`items_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_teacher_observations_date` ON `teacher_observations` (`observed_at`);--> statement-breakpoint
CREATE INDEX `idx_teacher_observations_teacher_date` ON `teacher_observations` (`teacher_id`,`observed_at`);