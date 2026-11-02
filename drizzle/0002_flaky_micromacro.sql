CREATE TABLE `lab_notebooks` (
	`user_id` text NOT NULL,
	`stage_id` text NOT NULL,
	`prediction` text NOT NULL,
	`reason` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `stage_id`)
);
