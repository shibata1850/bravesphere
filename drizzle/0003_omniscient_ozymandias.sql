CREATE TABLE `measurements` (
	`id` varchar(64) NOT NULL,
	`playerId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`value` int NOT NULL,
	`unit` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_logs` (
	`id` varchar(64) NOT NULL,
	`playerId` varchar(64) NOT NULL,
	`drillName` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`duration` int,
	`successRate` int,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `training_logs_id` PRIMARY KEY(`id`)
);
