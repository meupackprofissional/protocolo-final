CREATE TABLE `leads` (
	`id` varchar(36) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`quiz_responses` text,
	`fbp` varchar(255),
	`fbc` varchar(255),
	`user_agent` text,
	`ip_address` varchar(45),
	`event_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
