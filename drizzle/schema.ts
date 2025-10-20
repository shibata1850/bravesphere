import {
  boolean,
  datetime,
  float,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams table - チーム情報
 */
export const teams = mysqlTable("teams", {
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
export const players = mysqlTable("players", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  number: int("number"),
  position: varchar("position", { length: 20 }),
  height: int("height"), // cm
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Games table - 試合情報
 */
export const games = mysqlTable("games", {
  id: varchar("id", { length: 64 }).primaryKey(),
  homeTeamId: varchar("homeTeamId", { length: 64 }).notNull(),
  awayTeamId: varchar("awayTeamId", { length: 64 }).notNull(),
  gameDate: datetime("gameDate").notNull(),
  venue: varchar("venue", { length: 100 }),
  videoUrl: text("videoUrl"),
  videoPath: text("videoPath"),
  analysisStatus: mysqlEnum("analysisStatus", [
    "pending",
    "processing",
    "completed",
    "failed",
  ])
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
export const events = mysqlTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  timestamp: int("timestamp").notNull(), // 秒単位
  period: int("period").notNull(), // ピリオド
  eventType: mysqlEnum("eventType", [
    "shot",
    "rebound",
    "assist",
    "turnover",
    "steal",
    "block",
    "foul",
    "substitution",
  ]).notNull(),
  playerId: varchar("playerId", { length: 64 }),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  xCoord: float("xCoord"), // コート上のX座標
  yCoord: float("yCoord"), // コート上のY座標
  success: boolean("success"), // ショットの成否
  shotType: mysqlEnum("shotType", ["2P", "3P", "FT"]), // ショットタイプ
  assistedBy: varchar("assistedBy", { length: 64 }), // アシストした選手ID
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Stats table - 集計スタッツ（試合別・選手別）
 */
export const stats = mysqlTable("stats", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  points: int("points").default(0).notNull(),
  rebounds: int("rebounds").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  steals: int("steals").default(0).notNull(),
  blocks: int("blocks").default(0).notNull(),
  turnovers: int("turnovers").default(0).notNull(),
  fgm: int("fgm").default(0).notNull(), // FG成功数
  fga: int("fga").default(0).notNull(), // FG試投数
  fg3m: int("fg3m").default(0).notNull(), // 3P成功数
  fg3a: int("fg3a").default(0).notNull(), // 3P試投数
  ftm: int("ftm").default(0).notNull(), // FT成功数
  fta: int("fta").default(0).notNull(), // FT試投数
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Stat = typeof stats.$inferSelect;
export type InsertStat = typeof stats.$inferInsert;

/**
 * Lineups table - ラインナップ情報（時間帯別の選手構成）
 */
export const lineups = mysqlTable("lineups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  period: int("period").notNull(),
  startTime: int("startTime").notNull(), // 秒単位
  endTime: int("endTime").notNull(), // 秒単位
  player1Id: varchar("player1Id", { length: 64 }).notNull(),
  player2Id: varchar("player2Id", { length: 64 }).notNull(),
  player3Id: varchar("player3Id", { length: 64 }).notNull(),
  player4Id: varchar("player4Id", { length: 64 }).notNull(),
  player5Id: varchar("player5Id", { length: 64 }).notNull(),
  pointsScored: int("pointsScored").default(0).notNull(),
  pointsAllowed: int("pointsAllowed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Lineup = typeof lineups.$inferSelect;
export type InsertLineup = typeof lineups.$inferInsert;

// PDF Export Settings
export const pdfSettings = mysqlTable("pdf_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  settingType: varchar("settingType", { length: 64 }).notNull(), // 'scouting' or 'setplay'
  sections: text("sections").notNull(), // JSON string
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type PdfSetting = typeof pdfSettings.$inferSelect;
export type InsertPdfSetting = typeof pdfSettings.$inferInsert;

// トレーニング記録テーブル
export const trainingLogs = mysqlTable("training_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  drillName: varchar("drillName", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  duration: int("duration"), // 分単位
  successRate: int("successRate"), // パーセンテージ
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type TrainingLog = typeof trainingLogs.$inferSelect;
export type InsertTrainingLog = typeof trainingLogs.$inferInsert;

// チーム練習メニュー
export const teamPractices = mysqlTable("team_practices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  practiceDate: timestamp("practiceDate").notNull(),
  duration: int("duration").notNull(), // 分単位
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
export const measurements = mysqlTable("measurements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  date: timestamp("date").notNull(),
  metricName: varchar("metricName", { length: 255 }).notNull(), // 例: "ミドルレンジFG%", "リバウンド数"
  value: int("value").notNull(), // 実際の値（小数点は整数化して保存）
  unit: varchar("unit", { length: 50 }), // 単位（%、回、など）
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

/**
 * Playlists table - プレイリスト情報（得点シーン等）
 */
export const playlists = mysqlTable("playlists", {
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
export const playlistEvents = mysqlTable("playlistEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playlistId: varchar("playlistId", { length: 64 }).notNull(),
  eventId: varchar("eventId", { length: 64 }).notNull(),
  sequenceOrder: int("sequenceOrder").notNull(), // プレイリスト内の順序
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PlaylistEvent = typeof playlistEvents.$inferSelect;
export type InsertPlaylistEvent = typeof playlistEvents.$inferInsert;

