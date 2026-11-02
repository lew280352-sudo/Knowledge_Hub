CREATE TABLE `learner_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`difficulty` text NOT NULL,
	`goal` text NOT NULL,
	`onboarding_completed` integer NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL
);
