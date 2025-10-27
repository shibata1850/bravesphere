CREATE TABLE `analyzedEvents` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`timestamp` float NOT NULL,
	`eventType` enum('shot','rebound','assist','turnover','steal','block','foul','substitution') NOT NULL,
	`playerId` varchar(64),
	`playerNumber` int,
	`teamId` varchar(64) NOT NULL,
	`xCoord` float,
	`yCoord` float,
	`success` boolean,
	`shotType` enum('2P','3P','FT'),
	`assistedBy` varchar(64),
	`confidence` float NOT NULL,
	`description` text,
	`rawData` text,
	`verified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `analyzedEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoAnalysisJobs` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`status` enum('queued','downloading','analyzing_video','analyzing_events','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`videoIntelligenceJobId` varchar(255),
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `videoAnalysisJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoKeyFrames` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`timestamp` float NOT NULL,
	`frameType` enum('shot_attempt','score_change','ball_possession_change','period_start','period_end') NOT NULL,
	`imagePath` text NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `videoKeyFrames_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoTrackingData` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`dataType` enum('object_tracking','text_detection','shot_detection','label_detection') NOT NULL,
	`timestamp` float NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `videoTrackingData_id` PRIMARY KEY(`id`)
);
