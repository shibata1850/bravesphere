CREATE TABLE `team_practices` (
	`id` varchar(64) NOT NULL,
	`teamId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`practiceDate` timestamp NOT NULL,
	`duration` int NOT NULL,
	`location` varchar(255),
	`focus` varchar(100),
	`drills` text,
	`attendance` text,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `team_practices_id` PRIMARY KEY(`id`)
);
