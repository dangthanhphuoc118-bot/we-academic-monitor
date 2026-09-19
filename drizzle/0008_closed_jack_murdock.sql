CREATE TABLE `freestyle_banks` (
	`program_code` text PRIMARY KEY NOT NULL,
	`categories_json` text DEFAULT '[]' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
UPDATE `curriculum_overrides`
SET `freestyle_questions` = '[]'
WHERE `program_code` IN ('STARTERS', 'MOVERS', 'FLYERS');
