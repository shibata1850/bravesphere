CREATE TYPE "public"."analysisStatus" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."dataType" AS ENUM('object_tracking', 'text_detection', 'shot_detection', 'label_detection');--> statement-breakpoint
CREATE TYPE "public"."eventType" AS ENUM('shot', 'rebound', 'assist', 'turnover', 'steal', 'block', 'foul', 'substitution');--> statement-breakpoint
CREATE TYPE "public"."frameType" AS ENUM('shot_attempt', 'score_change', 'ball_possession_change', 'period_start', 'period_end');--> statement-breakpoint
CREATE TYPE "public"."jobStatus" AS ENUM('queued', 'downloading', 'analyzing_video', 'analyzing_events', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."shotType" AS ENUM('2P', '3P', 'FT');--> statement-breakpoint
CREATE TABLE "analyzedEvents" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"jobId" varchar(64) NOT NULL,
	"timestamp" double precision NOT NULL,
	"eventType" "eventType" NOT NULL,
	"playerId" varchar(64),
	"playerNumber" integer,
	"teamId" varchar(64) NOT NULL,
	"xCoord" double precision,
	"yCoord" double precision,
	"success" boolean,
	"shotType" "shotType",
	"assistedBy" varchar(64),
	"confidence" double precision NOT NULL,
	"description" text,
	"rawData" text,
	"verified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"timestamp" integer NOT NULL,
	"period" integer NOT NULL,
	"eventType" "eventType" NOT NULL,
	"playerId" varchar(64),
	"teamId" varchar(64) NOT NULL,
	"xCoord" double precision,
	"yCoord" double precision,
	"success" boolean,
	"shotType" "shotType",
	"assistedBy" varchar(64),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"homeTeamId" varchar(64) NOT NULL,
	"awayTeamId" varchar(64) NOT NULL,
	"gameDate" timestamp NOT NULL,
	"venue" varchar(100),
	"videoUrl" text,
	"videoPath" text,
	"analysisStatus" "analysisStatus" DEFAULT 'pending' NOT NULL,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lineups" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"teamId" varchar(64) NOT NULL,
	"period" integer NOT NULL,
	"startTime" integer NOT NULL,
	"endTime" integer NOT NULL,
	"player1Id" varchar(64) NOT NULL,
	"player2Id" varchar(64) NOT NULL,
	"player3Id" varchar(64) NOT NULL,
	"player4Id" varchar(64) NOT NULL,
	"player5Id" varchar(64) NOT NULL,
	"pointsScored" integer DEFAULT 0 NOT NULL,
	"pointsAllowed" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"playerId" varchar(64) NOT NULL,
	"date" timestamp NOT NULL,
	"metricName" varchar(255) NOT NULL,
	"value" integer NOT NULL,
	"unit" varchar(50),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pdf_settings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"settingType" varchar(64) NOT NULL,
	"sections" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"teamId" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"number" integer,
	"position" varchar(20),
	"height" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlistEvents" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"playlistId" varchar(64) NOT NULL,
	"eventId" varchar(64) NOT NULL,
	"sequenceOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"filterType" varchar(50),
	"videoPath" text,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"playerId" varchar(64) NOT NULL,
	"teamId" varchar(64) NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"rebounds" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"steals" integer DEFAULT 0 NOT NULL,
	"blocks" integer DEFAULT 0 NOT NULL,
	"turnovers" integer DEFAULT 0 NOT NULL,
	"fgm" integer DEFAULT 0 NOT NULL,
	"fga" integer DEFAULT 0 NOT NULL,
	"fg3m" integer DEFAULT 0 NOT NULL,
	"fg3a" integer DEFAULT 0 NOT NULL,
	"ftm" integer DEFAULT 0 NOT NULL,
	"fta" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_practices" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"teamId" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"practiceDate" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"location" varchar(255),
	"focus" varchar(100),
	"drills" text,
	"attendance" text,
	"notes" text,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"organization" varchar(100),
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"playerId" varchar(64) NOT NULL,
	"drillName" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"duration" integer,
	"successRate" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videoAnalysisJobs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"status" "jobStatus" DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"videoIntelligenceJobId" varchar(255),
	"errorMessage" text,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videoKeyFrames" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"jobId" varchar(64) NOT NULL,
	"timestamp" double precision NOT NULL,
	"frameType" "frameType" NOT NULL,
	"imagePath" text NOT NULL,
	"imageUrl" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videoTrackingData" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"gameId" varchar(64) NOT NULL,
	"jobId" varchar(64) NOT NULL,
	"dataType" "dataType" NOT NULL,
	"timestamp" double precision NOT NULL,
	"data" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
