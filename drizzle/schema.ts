import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Define enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const analysisStatusEnum = pgEnum("analysisStatus", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const eventTypeEnum = pgEnum("eventType", [
  "shot",
  "rebound",
  "assist",
  "turnover",
  "steal",
  "block",
  "foul",
  "substitution",
]);
export const shotTypeEnum = pgEnum("shotType", ["2P", "3P", "FT"]);
export const videoJobStatusEnum = pgEnum("videoJobStatus", [
  "queued",
  "downloading",
  "analyzing_video",
  "analyzing_events",
  "completed",
  "failed",
]);
export const dataTypeEnum = pgEnum("dataType", [
  "object_tracking",
  "text_detection",
  "shot_detection",
  "label_detection",
]);
export const frameTypeEnum = pgEnum("frameType", [
  "shot_attempt",
  "score_change",
  "ball_possession_change",
  "period_start",
  "period_end",
]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams table - チーム情報
 */
export const teams = pgTable("teams", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  organization: varchar("organization", { length: 100 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Players table - 選手情報
 */
export const players = pgTable("players", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  number: integer("number"),
  position: varchar("position", { length: 20 }),
  height: integer("height"), // cm
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Games table - 試合情報
 */
export const games = pgTable("games", {
  id: varchar("id", { length: 64 }).primaryKey(),
  homeTeamId: varchar("homeTeamId", { length: 64 }).notNull(),
  awayTeamId: varchar("awayTeamId", { length: 64 }).notNull(),
  gameDate: timestamp("gameDate").notNull(),
  venue: varchar("venue", { length: 100 }),
  videoUrl: text("videoUrl"),
  videoPath: text("videoPath"),
  analysisStatus: analysisStatusEnum("analysisStatus")
    .default("pending")
    .notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

/**
 * Events table - イベントログ（ショット、リバウンド、アシスト等）
 */
export const events = pgTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  timestamp: integer("timestamp").notNull(), // 秒単位
  period: integer("period").notNull(), // ピリオド
  eventType: eventTypeEnum("eventType").notNull(),
  playerId: varchar("playerId", { length: 64 }),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  xCoord: doublePrecision("xCoord"), // コート上のX座標
  yCoord: doublePrecision("yCoord"), // コート上のY座標
  success: boolean("success"), // ショットの成否
  shotType: shotTypeEnum("shotType"), // ショットタイプ
  assistedBy: varchar("assistedBy", { length: 64 }), // アシストした選手ID
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Stats table - 集計スタッツ（試合別・選手別）
 */
export const stats = pgTable("stats", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  points: integer("points").default(0).notNull(),
  rebounds: integer("rebounds").default(0).notNull(),
  assists: integer("assists").default(0).notNull(),
  steals: integer("steals").default(0).notNull(),
  blocks: integer("blocks").default(0).notNull(),
  turnovers: integer("turnovers").default(0).notNull(),
  fgm: integer("fgm").default(0).notNull(), // FG成功数
  fga: integer("fga").default(0).notNull(), // FG試投数
  fg3m: integer("fg3m").default(0).notNull(), // 3P成功数
  fg3a: integer("fg3a").default(0).notNull(), // 3P試投数
  ftm: integer("ftm").default(0).notNull(), // FT成功数
  fta: integer("fta").default(0).notNull(), // FT試投数
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Stat = typeof stats.$inferSelect;
export type InsertStat = typeof stats.$inferInsert;

/**
 * Lineups table - ラインナップ情報（時間帯別の選手構成）
 */
export const lineups = pgTable("lineups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  period: integer("period").notNull(),
  startTime: integer("startTime").notNull(), // 秒単位
  endTime: integer("endTime").notNull(), // 秒単位
  player1Id: varchar("player1Id", { length: 64 }).notNull(),
  player2Id: varchar("player2Id", { length: 64 }).notNull(),
  player3Id: varchar("player3Id", { length: 64 }).notNull(),
  player4Id: varchar("player4Id", { length: 64 }).notNull(),
  player5Id: varchar("player5Id", { length: 64 }).notNull(),
  pointsScored: integer("pointsScored").default(0).notNull(),
  pointsAllowed: integer("pointsAllowed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Lineup = typeof lineups.$inferSelect;
export type InsertLineup = typeof lineups.$inferInsert;

// PDF Export Settings
export const pdfSettings = pgTable("pdf_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  settingType: varchar("settingType", { length: 64 }).notNull(), // 'scouting' or 'setplay'
  sections: text("sections").notNull(), // JSON string
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type PdfSetting = typeof pdfSettings.$inferSelect;
export type InsertPdfSetting = typeof pdfSettings.$inferInsert;

// トレーニング記録テーブル
export const trainingLogs = pgTable("training_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  drillName: varchar("drillName", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  duration: integer("duration"), // 分単位
  successRate: integer("successRate"), // パーセンテージ
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type TrainingLog = typeof trainingLogs.$inferSelect;
export type InsertTrainingLog = typeof trainingLogs.$inferInsert;

// チーム練習メニュー
export const teamPractices = pgTable("team_practices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  practiceDate: timestamp("practiceDate").notNull(),
  duration: integer("duration").notNull(), // 分単位
  location: varchar("location", { length: 255 }),
  focus: varchar("focus", { length: 100 }), // オフェンス、ディフェンス、フィジカル等
  drills: text("drills"), // JSON形式でドリル情報を保存
  attendance: text("attendance"), // JSON形式で出席状況を保存
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type TeamPractice = typeof teamPractices.$inferSelect;
export type InsertTeamPractice = typeof teamPractices.$inferInsert;

// 測定記録テーブル
export const measurements = pgTable("measurements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  date: timestamp("date").notNull(),
  metricName: varchar("metricName", { length: 255 }).notNull(), // 例: "ミドルレンジFG%", "リバウンド数"
  value: integer("value").notNull(), // 実際の値（小数点は整数化して保存）
  unit: varchar("unit", { length: 50 }), // 単位（%、回、など）
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

/**
 * Playlists table - プレイリスト情報（得点シーン等）
 */
export const playlists = pgTable("playlists", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  filterType: varchar("filterType", { length: 50 }), // 'scoring', 'turnover', 'defensive' etc.
  videoPath: text("videoPath"), // 生成された動画のパス
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * PlaylistEvents table - プレイリストに含まれるイベント
 */
export const playlistEvents = pgTable("playlistEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playlistId: varchar("playlistId", { length: 64 }).notNull(),
  eventId: varchar("eventId", { length: 64 }).notNull(),
  sequenceOrder: integer("sequenceOrder").notNull(), // プレイリスト内の順序
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PlaylistEvent = typeof playlistEvents.$inferSelect;
export type InsertPlaylistEvent = typeof playlistEvents.$inferInsert;

/**
 * VideoAnalysisJobs table - 動画解析ジョブの状態管理
 */
export const videoAnalysisJobs = pgTable("videoAnalysisJobs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  status: videoJobStatusEnum("status")
    .default("queued")
    .notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  videoIntelligenceJobId: varchar("videoIntelligenceJobId", { length: 255 }),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VideoAnalysisJob = typeof videoAnalysisJobs.$inferSelect;
export type InsertVideoAnalysisJob = typeof videoAnalysisJobs.$inferInsert;

/**
 * VideoTrackingData table - Video Intelligence APIの生データ保存
 */
export const videoTrackingData = pgTable("videoTrackingData", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  dataType: dataTypeEnum("dataType").notNull(),
  timestamp: doublePrecision("timestamp").notNull(), // 秒単位（小数点対応）
  data: text("data").notNull(), // JSON形式で保存
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VideoTrackingData = typeof videoTrackingData.$inferSelect;
export type InsertVideoTrackingData = typeof videoTrackingData.$inferInsert;

/**
 * VideoKeyFrames table - キーフレーム画像の保存
 */
export const videoKeyFrames = pgTable("videoKeyFrames", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  timestamp: doublePrecision("timestamp").notNull(), // 秒単位
  frameType: frameTypeEnum("frameType").notNull(),
  imagePath: text("imagePath").notNull(), // S3パス
  imageUrl: text("imageUrl").notNull(), // 公開URL
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VideoKeyFrame = typeof videoKeyFrames.$inferSelect;
export type InsertVideoKeyFrame = typeof videoKeyFrames.$inferInsert;

/**
 * AnalyzedEvents table - Gemini APIが検出したイベント
 */
export const analyzedEvents = pgTable("analyzedEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  timestamp: doublePrecision("timestamp").notNull(), // 秒単位
  eventType: eventTypeEnum("eventType").notNull(),
  playerId: varchar("playerId", { length: 64 }),
  playerNumber: integer("playerNumber"), // 背番号（選手未特定時）
  teamId: varchar("teamId", { length: 64 }).notNull(),
  xCoord: doublePrecision("xCoord"),
  yCoord: doublePrecision("yCoord"),
  success: boolean("success"),
  shotType: shotTypeEnum("shotType"),
  assistedBy: varchar("assistedBy", { length: 64 }),
  confidence: doublePrecision("confidence").notNull(), // 0.0-1.0
  description: text("description"), // Geminiが生成した説明
  rawData: text("rawData"), // Geminiの生データ（JSON）
  verified: boolean("verified").default(false).notNull(), // 手動検証済みフラグ
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyzedEvent = typeof analyzedEvents.$inferSelect;
export type InsertAnalyzedEvent = typeof analyzedEvents.$inferInsert;

