-- PostgreSQL Schema for BraveSphere (Supabase)
-- Run this in Supabase SQL Editor to create all required tables

-- Create enum types
DO $$ BEGIN
    CREATE TYPE "role" AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "analysisStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "eventType" AS ENUM ('shot', 'rebound', 'assist', 'turnover', 'steal', 'block', 'foul', 'substitution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "shotType" AS ENUM ('2P', '3P', 'FT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "jobStatus" AS ENUM ('queued', 'downloading', 'analyzing_video', 'analyzing_events', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "dataType" AS ENUM ('object_tracking', 'text_detection', 'shot_detection', 'label_detection');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "frameType" AS ENUM ('shot_attempt', 'score_change', 'ball_possession_change', 'period_start', 'period_end');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar(64) PRIMARY KEY,
    "name" text,
    "email" varchar(320),
    "loginMethod" varchar(64),
    "role" "role" NOT NULL DEFAULT 'user',
    "createdAt" timestamp DEFAULT now(),
    "lastSignedIn" timestamp DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS "teams" (
    "id" varchar(64) PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "organization" varchar(100),
    "createdBy" varchar(64) NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS "players" (
    "id" varchar(64) PRIMARY KEY,
    "teamId" varchar(64) NOT NULL,
    "name" varchar(100) NOT NULL,
    "number" integer,
    "position" varchar(20),
    "height" integer,
    "createdAt" timestamp DEFAULT now()
);

-- Games table
CREATE TABLE IF NOT EXISTS "games" (
    "id" varchar(64) PRIMARY KEY,
    "homeTeamId" varchar(64) NOT NULL,
    "awayTeamId" varchar(64) NOT NULL,
    "gameDate" timestamp NOT NULL,
    "venue" varchar(100),
    "videoUrl" text,
    "videoPath" text,
    "analysisStatus" "analysisStatus" NOT NULL DEFAULT 'pending',
    "createdBy" varchar(64) NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS "events" (
    "id" varchar(64) PRIMARY KEY,
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

-- Stats table
CREATE TABLE IF NOT EXISTS "stats" (
    "id" varchar(64) PRIMARY KEY,
    "gameId" varchar(64) NOT NULL,
    "playerId" varchar(64) NOT NULL,
    "teamId" varchar(64) NOT NULL,
    "points" integer NOT NULL DEFAULT 0,
    "rebounds" integer NOT NULL DEFAULT 0,
    "assists" integer NOT NULL DEFAULT 0,
    "steals" integer NOT NULL DEFAULT 0,
    "blocks" integer NOT NULL DEFAULT 0,
    "turnovers" integer NOT NULL DEFAULT 0,
    "fgm" integer NOT NULL DEFAULT 0,
    "fga" integer NOT NULL DEFAULT 0,
    "fg3m" integer NOT NULL DEFAULT 0,
    "fg3a" integer NOT NULL DEFAULT 0,
    "ftm" integer NOT NULL DEFAULT 0,
    "fta" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp DEFAULT now()
);

-- Lineups table
CREATE TABLE IF NOT EXISTS "lineups" (
    "id" varchar(64) PRIMARY KEY,
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
    "pointsScored" integer NOT NULL DEFAULT 0,
    "pointsAllowed" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp DEFAULT now()
);

-- PDF Settings table
CREATE TABLE IF NOT EXISTS "pdf_settings" (
    "id" varchar(64) PRIMARY KEY,
    "userId" varchar(64) NOT NULL,
    "settingType" varchar(64) NOT NULL,
    "sections" text NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Training Logs table
CREATE TABLE IF NOT EXISTS "training_logs" (
    "id" varchar(64) PRIMARY KEY,
    "playerId" varchar(64) NOT NULL,
    "drillName" varchar(255) NOT NULL,
    "date" timestamp NOT NULL,
    "completed" boolean NOT NULL DEFAULT false,
    "duration" integer,
    "successRate" integer,
    "notes" text,
    "createdAt" timestamp DEFAULT now()
);

-- Team Practices table
CREATE TABLE IF NOT EXISTS "team_practices" (
    "id" varchar(64) PRIMARY KEY,
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

-- Measurements table
CREATE TABLE IF NOT EXISTS "measurements" (
    "id" varchar(64) PRIMARY KEY,
    "playerId" varchar(64) NOT NULL,
    "date" timestamp NOT NULL,
    "metricName" varchar(255) NOT NULL,
    "value" integer NOT NULL,
    "unit" varchar(50),
    "createdAt" timestamp DEFAULT now()
);

-- Playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
    "id" varchar(64) PRIMARY KEY,
    "gameId" varchar(64) NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "filterType" varchar(50),
    "videoPath" text,
    "createdBy" varchar(64) NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Playlist Events table
CREATE TABLE IF NOT EXISTS "playlistEvents" (
    "id" varchar(64) PRIMARY KEY,
    "playlistId" varchar(64) NOT NULL,
    "eventId" varchar(64) NOT NULL,
    "sequenceOrder" integer NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Video Analysis Jobs table
CREATE TABLE IF NOT EXISTS "videoAnalysisJobs" (
    "id" varchar(64) PRIMARY KEY,
    "gameId" varchar(64) NOT NULL,
    "status" "jobStatus" NOT NULL DEFAULT 'queued',
    "progress" integer NOT NULL DEFAULT 0,
    "videoIntelligenceJobId" varchar(255),
    "errorMessage" text,
    "startedAt" timestamp,
    "completedAt" timestamp,
    "createdAt" timestamp DEFAULT now()
);

-- Video Tracking Data table
CREATE TABLE IF NOT EXISTS "videoTrackingData" (
    "id" varchar(64) PRIMARY KEY,
    "gameId" varchar(64) NOT NULL,
    "jobId" varchar(64) NOT NULL,
    "dataType" "dataType" NOT NULL,
    "timestamp" double precision NOT NULL,
    "data" text NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Video Key Frames table
CREATE TABLE IF NOT EXISTS "videoKeyFrames" (
    "id" varchar(64) PRIMARY KEY,
    "gameId" varchar(64) NOT NULL,
    "jobId" varchar(64) NOT NULL,
    "timestamp" double precision NOT NULL,
    "frameType" "frameType" NOT NULL,
    "imagePath" text NOT NULL,
    "imageUrl" text NOT NULL,
    "createdAt" timestamp DEFAULT now()
);

-- Analyzed Events table
CREATE TABLE IF NOT EXISTS "analyzedEvents" (
    "id" varchar(64) PRIMARY KEY,
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
    "verified" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_teams_createdBy" ON "teams" ("createdBy");
CREATE INDEX IF NOT EXISTS "idx_players_teamId" ON "players" ("teamId");
CREATE INDEX IF NOT EXISTS "idx_games_createdBy" ON "games" ("createdBy");
CREATE INDEX IF NOT EXISTS "idx_games_homeTeamId" ON "games" ("homeTeamId");
CREATE INDEX IF NOT EXISTS "idx_games_awayTeamId" ON "games" ("awayTeamId");
CREATE INDEX IF NOT EXISTS "idx_events_gameId" ON "events" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_stats_gameId" ON "stats" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_lineups_gameId" ON "lineups" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_playlists_gameId" ON "playlists" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_playlistEvents_playlistId" ON "playlistEvents" ("playlistId");
CREATE INDEX IF NOT EXISTS "idx_videoAnalysisJobs_gameId" ON "videoAnalysisJobs" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_videoTrackingData_gameId" ON "videoTrackingData" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_videoKeyFrames_gameId" ON "videoKeyFrames" ("gameId");
CREATE INDEX IF NOT EXISTS "idx_analyzedEvents_gameId" ON "analyzedEvents" ("gameId");
