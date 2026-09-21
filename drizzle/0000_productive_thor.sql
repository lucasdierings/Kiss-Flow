CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_idx` ON `account` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text DEFAULT '' NOT NULL,
	`avatar_url` text,
	`phone` text,
	`primary_archetype` text NOT NULL,
	`secondary_archetype` text,
	`love_language` text,
	`pipeline_stage` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`closing_goal` text,
	`lost_reason` text,
	`lost_at` integer,
	`post_mortem` text,
	`goal_achieved_at` integer,
	`goal_evidence` text,
	`notes` text DEFAULT '' NOT NULL,
	`mystery_coefficient` real DEFAULT 85 NOT NULL,
	`tension_level` real DEFAULT 30 NOT NULL,
	`enchantment_score` real DEFAULT 0 NOT NULL,
	`victim_score` real DEFAULT 10 NOT NULL,
	`scarcity_score` real DEFAULT 70 NOT NULL,
	`vuln_fantasy` integer DEFAULT 50 NOT NULL,
	`vuln_snobbery` integer DEFAULT 50 NOT NULL,
	`vuln_loneliness` integer DEFAULT 50 NOT NULL,
	`vuln_ego` integer DEFAULT 50 NOT NULL,
	`vuln_adventure` integer DEFAULT 50 NOT NULL,
	`vuln_rebellion` integer DEFAULT 50 NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contacts_user_status_stage_idx` ON `contacts` (`user_id`,`status`,`pipeline_stage`);--> statement-breakpoint
CREATE INDEX `contacts_user_updated_idx` ON `contacts` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`type_id` text NOT NULL,
	`category` text NOT NULL,
	`sentiment` real DEFAULT 0 NOT NULL,
	`occurred_at` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`initiated_by_target` integer DEFAULT false NOT NULL,
	`duration_minutes` integer,
	`location` text,
	`mystery_after` real,
	`tension_after` real,
	`enchantment_after` real,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `interactions_user_contact_date_idx` ON `interactions` (`user_id`,`contact_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `interactions_user_date_idx` ON `interactions` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `media_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text,
	`r2_key` text NOT NULL,
	`kind` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_uploads_r2_key_unique` ON `media_uploads` (`r2_key`);--> statement-breakpoint
CREATE INDEX `media_user_created_idx` ON `media_uploads` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `onboarding_answer` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_key` text NOT NULL,
	`answer_value` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `onboarding_answer_user_idx` ON `onboarding_answer` (`user_id`);--> statement-breakpoint
CREATE TABLE `phase_transitions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`old_phase` text NOT NULL,
	`new_phase` text NOT NULL,
	`evidence` text NOT NULL,
	`lost_reason` text,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `transitions_user_contact_idx` ON `phase_transitions` (`user_id`,`contact_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `transitions_user_created_idx` ON `phase_transitions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_expires_idx` ON `session` (`expires_at`);--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`alert_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`action_suggested` text,
	`tactic_number` integer,
	`tactic_name` text,
	`metrics_context` text,
	`dismissed` integer DEFAULT false NOT NULL,
	`executed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alerts_dedupe_idx` ON `system_alerts` (`user_id`,`contact_id`,`alert_type`);--> statement-breakpoint
CREATE INDEX `alerts_user_active_idx` ON `system_alerts` (`user_id`,`dismissed`,`created_at`);--> statement-breakpoint
CREATE TABLE `usage_counters` (
	`user_id` text NOT NULL,
	`period` text NOT NULL,
	`feature` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `period`, `feature`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text,
	`feature` text NOT NULL,
	`feature_detail` text NOT NULL,
	`model` text,
	`tokens_in` integer,
	`tokens_out` integer,
	`latency_ms` integer,
	`status` text DEFAULT 'ok' NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `usage_events_user_created_idx` ON `usage_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`terms_version` text NOT NULL,
	`granted_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`revoked_at` integer,
	`ip_address` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `consents_user_kind_idx` ON `user_consents` (`user_id`,`kind`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`gender` text,
	`orientation` text,
	`age_range` text,
	`avatar_url` text,
	`seducer_archetype` text DEFAULT 'charmer' NOT NULL,
	`active_contact_id` text,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`plan_expires_at` integer,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);