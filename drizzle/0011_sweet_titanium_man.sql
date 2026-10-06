ALTER TABLE `students` ADD `custom_grading` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `redflag_below` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `good_from` integer DEFAULT 81 NOT NULL;