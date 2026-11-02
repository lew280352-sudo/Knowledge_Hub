CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stage_id` text,
	`chapter` text,
	`status` text NOT NULL,
	`revision` integer NOT NULL,
	`questions` text NOT NULL,
	`answers` text NOT NULL,
	`current_index` integer NOT NULL,
	`last_event_id` text,
	`created_at` text NOT NULL,
	`submitted_at` text,
	`deadline` text,
	`score` integer,
	`correct_count` integer
);
--> statement-breakpoint
CREATE TABLE `game_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stage_id` text NOT NULL,
	`correct` integer NOT NULL,
	`total` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`stage_id` text NOT NULL,
	`step` integer NOT NULL,
	`completed` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `stage_id`)
);
