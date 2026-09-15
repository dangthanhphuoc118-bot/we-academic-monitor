CREATE TABLE `level_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`program_code` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_level_options_label_unique` ON `level_options` (`label`);--> statement-breakpoint
CREATE INDEX `idx_level_options_active_sort` ON `level_options` (`active`,`sort_order`);--> statement-breakpoint
INSERT INTO `level_options` (`label`, `program_code`, `active`, `sort_order`) VALUES
	('Baby Stars', 'BABY_STARS', 1, 10),
	('Super Kids 1', 'SUPER_KIDS_1', 1, 20),
	('Super Kids 2', 'SUPER_KIDS_2', 1, 30),
	('Super Kids 3', 'SUPER_KIDS_3', 1, 40),
	('Super Kids 4', 'SUPER_KIDS_4', 1, 50),
	('Super Kids 5', 'SUPER_KIDS_5', 1, 60),
	('Super Kids 6', 'SUPER_KIDS_6', 1, 70),
	('Super Kids 7', 'SUPER_KIDS_7', 1, 80),
	('Super Kids 8', 'SUPER_KIDS_8', 1, 90),
	('Starters', 'STARTERS', 1, 100),
	('Movers', 'MOVERS', 1, 110),
	('Flyers', 'FLYERS', 1, 120),
	('Pre A1', '', 1, 130),
	('A1', '', 1, 140),
	('A2', '', 1, 150),
	('B1', '', 1, 160),
	('B2', '', 1, 170),
	('C1', '', 1, 180),
	('IELTS', '', 1, 190),
	('Khác', '', 1, 200);--> statement-breakpoint
CREATE TABLE `student_feedback_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text DEFAULT 'Nhận xét chung' NOT NULL,
	`label` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_student_feedback_options_label_unique` ON `student_feedback_options` (`label`);--> statement-breakpoint
CREATE INDEX `idx_student_feedback_options_active_sort` ON `student_feedback_options` (`active`,`sort_order`);--> statement-breakpoint
INSERT INTO `student_feedback_options` (`category`, `label`, `active`, `sort_order`) VALUES
	('Điểm mạnh', 'Nhớ và sử dụng từ vựng tốt', 1, 10),
	('Điểm mạnh', 'Phản xạ giao tiếp nhanh', 1, 20),
	('Điểm mạnh', 'Phát âm rõ ràng', 1, 30),
	('Cần cải thiện', 'Cần ôn lại từ vựng', 1, 40),
	('Cần cải thiện', 'Chưa chắc cấu trúc ngữ pháp', 1, 50),
	('Cần cải thiện', 'Âm cuối chưa rõ', 1, 60),
	('Cần cải thiện', 'Cần tự tin hơn khi trả lời', 1, 70),
	('Thái độ học tập', 'Cần tập trung hơn trong giờ học', 1, 80);--> statement-breakpoint
ALTER TABLE `learning_checks` ADD `feedback_json` text DEFAULT '[]' NOT NULL;
