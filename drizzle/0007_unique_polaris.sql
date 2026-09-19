CREATE TABLE `class_teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`teacher_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_teachers_class_teacher_unique` ON `class_teachers` (`class_id`,`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_class_teachers_teacher_id` ON `class_teachers` (`teacher_id`);--> statement-breakpoint
INSERT OR IGNORE INTO `class_teachers` (`class_id`, `teacher_id`)
SELECT `id`, `teacher_id` FROM `classes` WHERE `teacher_id` IS NOT NULL;
