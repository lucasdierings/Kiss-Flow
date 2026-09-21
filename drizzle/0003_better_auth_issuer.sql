DROP INDEX `account_provider_idx`;--> statement-breakpoint
ALTER TABLE `account` ADD `issuer` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_idx` ON `account` (`issuer`,`account_id`);