CREATE TABLE `events` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`timestamp` int NOT NULL,
	`period` int NOT NULL,
	`eventType` enum('shot','rebound','assist','turnover','steal','block','foul','substitution') NOT NULL,
	`playerId` varchar(64),
	`teamId` varchar(64) NOT NULL,
	`xCoord` float,
	`yCoord` float,
	`success` boolean,
	`shotType` enum('2P','3P','FT'),
	`assistedBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` varchar(64) NOT NULL,
	`homeTeamId` varchar(64) NOT NULL,
	`awayTeamId` varchar(64) NOT NULL,
	`gameDate` datetime NOT NULL,
	`venue` varchar(100),
	`videoUrl` text,
	`videoPath` text,
	`analysisStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lineups` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`teamId` varchar(64) NOT NULL,
	`period` int NOT NULL,
	`startTime` int NOT NULL,
	`endTime` int NOT NULL,
	`player1Id` varchar(64) NOT NULL,
	`player2Id` varchar(64) NOT NULL,
	`player3Id` varchar(64) NOT NULL,
	`player4Id` varchar(64) NOT NULL,
	`player5Id` varchar(64) NOT NULL,
	`pointsScored` int NOT NULL DEFAULT 0,
	`pointsAllowed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `lineups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` varchar(64) NOT NULL,
	`teamId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`number` int NOT NULL,
	`position` varchar(20),
	`height` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlistEvents` (
	`id` varchar(64) NOT NULL,
	`playlistId` varchar(64) NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`sequenceOrder` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `playlistEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`filterType` varchar(50),
	`videoPath` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`playerId` varchar(64) NOT NULL,
	`teamId` varchar(64) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`rebounds` int NOT NULL DEFAULT 0,
	`assists` int NOT NULL DEFAULT 0,
	`steals` int NOT NULL DEFAULT 0,
	`blocks` int NOT NULL DEFAULT 0,
	`turnovers` int NOT NULL DEFAULT 0,
	`fgm` int NOT NULL DEFAULT 0,
	`fga` int NOT NULL DEFAULT 0,
	`fg3m` int NOT NULL DEFAULT 0,
	`fg3a` int NOT NULL DEFAULT 0,
	`ftm` int NOT NULL DEFAULT 0,
	`fta` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`organization` varchar(100),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
