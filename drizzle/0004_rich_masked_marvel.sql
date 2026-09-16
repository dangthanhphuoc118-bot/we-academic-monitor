CREATE TABLE `student_check_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`class_id` integer,
	`scheduled_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_student_check_queue_student_date` ON `student_check_queue` (`student_id`,`scheduled_date`);--> statement-breakpoint
CREATE INDEX `idx_student_check_queue_date_status` ON `student_check_queue` (`scheduled_date`,`status`);--> statement-breakpoint
CREATE INDEX `idx_student_check_queue_class_date` ON `student_check_queue` (`class_id`,`scheduled_date`);