CREATE TABLE `pdf_settings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`settingType` varchar(64) NOT NULL,
	`sections` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdf_settings_id` PRIMARY KEY(`id`)
);
