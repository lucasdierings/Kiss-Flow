CREATE TABLE `contact_traits` (
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`axis` text NOT NULL,
	`value` integer NOT NULL,
	`source` text NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`evidence` text,
	`observed_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `contact_id`, `axis`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `traits_user_contact_idx` ON `contact_traits` (`user_id`,`contact_id`);--> statement-breakpoint
ALTER TABLE `user_profile` ADD `city` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `relationship_goal` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `love_language` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `bio` text;