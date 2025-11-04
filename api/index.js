var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
      googleCloudCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ?? "",
      googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID ?? "",
      googleCloudStorageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET ?? ""
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey, _expiresIn = 300) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/pdfGenerator.ts
var pdfGenerator_exports = {};
__export(pdfGenerator_exports, {
  generateScoutingReportPDF: () => generateScoutingReportPDF,
  generateSetPlayReportPDF: () => generateSetPlayReportPDF
});
async function generateScoutingReportPDF(game, homeTeam, awayTeam, sections) {
  const content = [];
  content.push(`# \u30B9\u30AB\u30A6\u30C6\u30A3\u30F3\u30B0\u30EC\u30DD\u30FC\u30C8`);
  content.push(`\u8A66\u5408\u65E5: ${new Date(game.gameDate).toLocaleDateString("ja-JP")}`);
  content.push(`${homeTeam.name} vs ${awayTeam.name}`);
  content.push(`
---
`);
  if (sections.playerTendencies) {
    content.push(`## \u9078\u624B\u5225\u50BE\u5411\u5206\u6790`);
    content.push(`\u5404\u9078\u624B\u306E\u5F37\u307F\u30FB\u5F31\u307F\u30FB\u30B7\u30E5\u30FC\u30C8\u50BE\u5411\u30FB\u5B88\u5099\u5F79\u5272\u3092\u5206\u6790`);
    content.push(`
`);
  }
  if (sections.setPlays) {
    content.push(`## \u30BB\u30C3\u30C8\u30D7\u30EC\u30FC\u5206\u6790`);
    content.push(`\u983B\u51FA\u3059\u308B\u30BB\u30C3\u30C8\u30D7\u30EC\u30FC\u3068\u305D\u306E\u5BFE\u7B56`);
    content.push(`
`);
  }
  if (sections.blobSlob) {
    content.push(`## BLOB/SLOB\u5206\u6790`);
    content.push(`\u30D9\u30FC\u30B9\u30E9\u30A4\u30F3\u30FB\u30B5\u30A4\u30C9\u30E9\u30A4\u30F3\u304B\u3089\u306E\u30A2\u30A6\u30C8\u30AA\u30D6\u30D0\u30A6\u30F3\u30BA\u30D7\u30EC\u30FC`);
    content.push(`
`);
  }
  if (sections.teamStrategy) {
    content.push(`## \u30C1\u30FC\u30E0\u6226\u7565`);
    content.push(`\u30AA\u30D5\u30A7\u30F3\u30B9\u30FB\u30C7\u30A3\u30D5\u30A7\u30F3\u30B9\u306E\u57FA\u672C\u6226\u7565`);
    content.push(`
`);
  }
  if (sections.keyMatchups) {
    content.push(`## \u91CD\u8981\u30DE\u30C3\u30C1\u30A2\u30C3\u30D7`);
    content.push(`\u6CE8\u76EE\u3059\u3079\u304D\u9078\u624B\u5BFE\u6C7A`);
    content.push(`
`);
  }
  const markdown = content.join("\n");
  const fs = __require("fs");
  const path = __require("path");
  const { execSync } = __require("child_process");
  const tmpDir = "/tmp/scouting-reports";
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const timestamp2 = Date.now();
  const mdPath = path.join(tmpDir, `report-${timestamp2}.md`);
  const pdfPath = path.join(tmpDir, `report-${timestamp2}.pdf`);
  fs.writeFileSync(mdPath, markdown);
  try {
    execSync(`manus-md-to-pdf ${mdPath} ${pdfPath}`);
    if (fs.existsSync(pdfPath)) {
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const pdfBuffer = fs.readFileSync(pdfPath);
      const result = await storagePut2(
        `reports/scouting-${timestamp2}.pdf`,
        pdfBuffer,
        "application/pdf"
      );
      fs.unlinkSync(mdPath);
      fs.unlinkSync(pdfPath);
      return result.url;
    }
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
  return `/reports/scouting-report-${timestamp2}.pdf`;
}
async function generateSetPlayReportPDF(gameId) {
  const timestamp2 = Date.now();
  return `/reports/setplay-report-${timestamp2}.pdf`;
}
var init_pdfGenerator = __esm({
  "server/pdfGenerator.ts"() {
    "use strict";
  }
});

// api/_index.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/cookies.ts
function isSecureRequest(req) {
  const protocol = req.protocol || (req.headers?.["x-forwarded-proto"] ? "https" : "http");
  if (protocol === "https") return true;
  const forwardedProto = req.headers?.["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
import {
  boolean,
  datetime,
  float,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow()
});
var teams = mysqlTable("teams", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  organization: varchar("organization", { length: 100 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow()
});
var players = mysqlTable("players", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  number: int("number"),
  position: varchar("position", { length: 20 }),
  height: int("height"),
  // cm
  createdAt: timestamp("createdAt").defaultNow()
});
var games = mysqlTable("games", {
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
    "failed"
  ]).default("pending").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow()
});
var events = mysqlTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  timestamp: int("timestamp").notNull(),
  // 秒単位
  period: int("period").notNull(),
  // ピリオド
  eventType: mysqlEnum("eventType", [
    "shot",
    "rebound",
    "assist",
    "turnover",
    "steal",
    "block",
    "foul",
    "substitution"
  ]).notNull(),
  playerId: varchar("playerId", { length: 64 }),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  xCoord: float("xCoord"),
  // コート上のX座標
  yCoord: float("yCoord"),
  // コート上のY座標
  success: boolean("success"),
  // ショットの成否
  shotType: mysqlEnum("shotType", ["2P", "3P", "FT"]),
  // ショットタイプ
  assistedBy: varchar("assistedBy", { length: 64 }),
  // アシストした選手ID
  createdAt: timestamp("createdAt").defaultNow()
});
var stats = mysqlTable("stats", {
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
  fgm: int("fgm").default(0).notNull(),
  // FG成功数
  fga: int("fga").default(0).notNull(),
  // FG試投数
  fg3m: int("fg3m").default(0).notNull(),
  // 3P成功数
  fg3a: int("fg3a").default(0).notNull(),
  // 3P試投数
  ftm: int("ftm").default(0).notNull(),
  // FT成功数
  fta: int("fta").default(0).notNull(),
  // FT試投数
  createdAt: timestamp("createdAt").defaultNow()
});
var lineups = mysqlTable("lineups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  period: int("period").notNull(),
  startTime: int("startTime").notNull(),
  // 秒単位
  endTime: int("endTime").notNull(),
  // 秒単位
  player1Id: varchar("player1Id", { length: 64 }).notNull(),
  player2Id: varchar("player2Id", { length: 64 }).notNull(),
  player3Id: varchar("player3Id", { length: 64 }).notNull(),
  player4Id: varchar("player4Id", { length: 64 }).notNull(),
  player5Id: varchar("player5Id", { length: 64 }).notNull(),
  pointsScored: int("pointsScored").default(0).notNull(),
  pointsAllowed: int("pointsAllowed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow()
});
var pdfSettings = mysqlTable("pdf_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  settingType: varchar("settingType", { length: 64 }).notNull(),
  // 'scouting' or 'setplay'
  sections: text("sections").notNull(),
  // JSON string
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
var trainingLogs = mysqlTable("training_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  drillName: varchar("drillName", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  duration: int("duration"),
  // 分単位
  successRate: int("successRate"),
  // パーセンテージ
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow()
});
var teamPractices = mysqlTable("team_practices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teamId: varchar("teamId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  practiceDate: timestamp("practiceDate").notNull(),
  duration: int("duration").notNull(),
  // 分単位
  location: varchar("location", { length: 255 }),
  focus: varchar("focus", { length: 100 }),
  // オフェンス、ディフェンス、フィジカル等
  drills: text("drills"),
  // JSON形式でドリル情報を保存
  attendance: text("attendance"),
  // JSON形式で出席状況を保存
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var measurements = mysqlTable("measurements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  date: timestamp("date").notNull(),
  metricName: varchar("metricName", { length: 255 }).notNull(),
  // 例: "ミドルレンジFG%", "リバウンド数"
  value: int("value").notNull(),
  // 実際の値（小数点は整数化して保存）
  unit: varchar("unit", { length: 50 }),
  // 単位（%、回、など）
  createdAt: timestamp("createdAt").defaultNow()
});
var playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  filterType: varchar("filterType", { length: 50 }),
  // 'scoring', 'turnover', 'defensive' etc.
  videoPath: text("videoPath"),
  // 生成された動画のパス
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow()
});
var playlistEvents = mysqlTable("playlistEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playlistId: varchar("playlistId", { length: 64 }).notNull(),
  eventId: varchar("eventId", { length: 64 }).notNull(),
  sequenceOrder: int("sequenceOrder").notNull(),
  // プレイリスト内の順序
  createdAt: timestamp("createdAt").defaultNow()
});
var videoAnalysisJobs = mysqlTable("videoAnalysisJobs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  status: mysqlEnum("status", [
    "queued",
    "downloading",
    "analyzing_video",
    "analyzing_events",
    "completed",
    "failed"
  ]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  // 0-100
  videoIntelligenceJobId: varchar("videoIntelligenceJobId", { length: 255 }),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow()
});
var videoTrackingData = mysqlTable("videoTrackingData", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  dataType: mysqlEnum("dataType", [
    "object_tracking",
    "text_detection",
    "shot_detection",
    "label_detection"
  ]).notNull(),
  timestamp: float("timestamp").notNull(),
  // 秒単位（小数点対応）
  data: text("data").notNull(),
  // JSON形式で保存
  createdAt: timestamp("createdAt").defaultNow()
});
var videoKeyFrames = mysqlTable("videoKeyFrames", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  timestamp: float("timestamp").notNull(),
  // 秒単位
  frameType: mysqlEnum("frameType", [
    "shot_attempt",
    "score_change",
    "ball_possession_change",
    "period_start",
    "period_end"
  ]).notNull(),
  imagePath: text("imagePath").notNull(),
  // S3パス
  imageUrl: text("imageUrl").notNull(),
  // 公開URL
  createdAt: timestamp("createdAt").defaultNow()
});
var analyzedEvents = mysqlTable("analyzedEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  timestamp: float("timestamp").notNull(),
  // 秒単位
  eventType: mysqlEnum("eventType", [
    "shot",
    "rebound",
    "assist",
    "turnover",
    "steal",
    "block",
    "foul",
    "substitution"
  ]).notNull(),
  playerId: varchar("playerId", { length: 64 }),
  playerNumber: int("playerNumber"),
  // 背番号（選手未特定時）
  teamId: varchar("teamId", { length: 64 }).notNull(),
  xCoord: float("xCoord"),
  yCoord: float("yCoord"),
  success: boolean("success"),
  shotType: mysqlEnum("shotType", ["2P", "3P", "FT"]),
  assistedBy: varchar("assistedBy", { length: 64 }),
  confidence: float("confidence").notNull(),
  // 0.0-1.0
  description: text("description"),
  // Geminiが生成した説明
  rawData: text("rawData"),
  // Geminiの生データ（JSON）
  verified: boolean("verified").default(false).notNull(),
  // 手動検証済みフラグ
  createdAt: timestamp("createdAt").defaultNow()
});

// server/db.ts
init_env();
var globalForDb = globalThis;
async function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Database] DATABASE_URL is not configured");
    return null;
  }
  if (globalForDb.__dbPool) {
    return globalForDb.__dbPool;
  }
  try {
    const connectionLimit = Number.parseInt(
      process.env.DB_CONNECTION_LIMIT ?? "1",
      10
    );
    const connectTimeout = Number.parseInt(
      process.env.DB_CONNECT_TIMEOUT ?? "10000",
      10
    );
    const useSsl = (process.env.DATABASE_SSL ?? "true").toLowerCase() !== "false";
    const rejectUnauthorized = (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false";
    globalForDb.__dbPool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: Number.isFinite(connectionLimit) ? Math.max(connectionLimit, 1) : 1,
      connectTimeout: Number.isFinite(connectTimeout) ? Math.max(connectTimeout, 1e3) : 1e4,
      ssl: useSsl ? { rejectUnauthorized } : void 0
    });
  } catch (error) {
    console.error("[Database] Failed to create connection pool:", error);
    globalForDb.__dbPool = null;
  }
  return globalForDb.__dbPool ?? null;
}
async function getDb() {
  if (globalForDb.__drizzleDb) {
    return globalForDb.__drizzleDb;
  }
  const pool = await getPool();
  if (!pool) {
    return null;
  }
  try {
    globalForDb.__drizzleDb = drizzle(pool);
  } catch (error) {
    console.error("[Database] Failed to initialize drizzle client:", error);
    globalForDb.__drizzleDb = null;
  }
  return globalForDb.__drizzleDb ?? null;
}
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      id: user.id
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === void 0) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createTeam(team) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(teams).values(team);
  const result = await db.select().from(teams).where(eq(teams.id, team.id)).limit(1);
  return result[0];
}
async function getTeam(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getTeamsByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.createdBy, userId));
}
async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).orderBy(desc(teams.createdAt));
}
async function createPlayer(player) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(players).values(player);
  const result = await db.select().from(players).where(eq(players.id, player.id)).limit(1);
  return result[0];
}
async function getPlayer(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(players).where(eq(players.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPlayersByTeam(teamId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(players).where(eq(players.teamId, teamId));
}
async function updatePlayer(id, updates) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(players).set(updates).where(eq(players.id, id));
  return getPlayer(id);
}
async function deletePlayer(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(players).where(eq(players.id, id));
}
async function createGame(game) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(games).values(game);
  const result = await db.select().from(games).where(eq(games.id, game.id)).limit(1);
  return result[0];
}
async function getGame(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getGamesByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(games).where(eq(games.createdBy, userId)).orderBy(desc(games.gameDate));
}
async function getAllGames() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(games).orderBy(desc(games.gameDate));
}
async function updateGame(id, updates) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(games).set(updates).where(eq(games.id, id));
  return getGame(id);
}
async function createEvent(event) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(events).values(event);
  const result = await db.select().from(events).where(eq(events.id, event.id)).limit(1);
  return result[0];
}
async function getEventsByGame(gameId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.gameId, gameId)).orderBy(events.timestamp);
}
async function updateEvent(id, updates) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(events).set(updates).where(eq(events.id, id));
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function deleteEvent(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}
async function createStat(stat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(stats).values(stat);
  const result = await db.select().from(stats).where(eq(stats.id, stat.id)).limit(1);
  return result[0];
}
async function getStatsByGame(gameId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stats).where(eq(stats.gameId, gameId));
}
async function getStatByGameAndPlayer(gameId, playerId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(stats).where(and(eq(stats.gameId, gameId), eq(stats.playerId, playerId))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateStat(id, updates) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(stats).set(updates).where(eq(stats.id, id));
  const result = await db.select().from(stats).where(eq(stats.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createLineup(lineup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(lineups).values(lineup);
  const result = await db.select().from(lineups).where(eq(lineups.id, lineup.id)).limit(1);
  return result[0];
}
async function getLineupsByGame(gameId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lineups).where(eq(lineups.gameId, gameId));
}
async function createPlaylist(playlist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playlists).values(playlist);
  const result = await db.select().from(playlists).where(eq(playlists.id, playlist.id)).limit(1);
  return result[0];
}
async function getPlaylist(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPlaylistsByGame(gameId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playlists).where(eq(playlists.gameId, gameId));
}
async function createPlaylistEvent(playlistEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playlistEvents).values(playlistEvent);
  const result = await db.select().from(playlistEvents).where(eq(playlistEvents.id, playlistEvent.id)).limit(1);
  return result[0];
}
async function getPlaylistEventsByPlaylist(playlistId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playlistEvents).where(eq(playlistEvents.playlistId, playlistId)).orderBy(playlistEvents.sequenceOrder);
}
async function savePdfSetting(setting) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(pdfSettings).values(setting).onDuplicateKeyUpdate({
    set: {
      sections: setting.sections,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
}
async function getPdfSetting(userId, settingType) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pdfSettings).where(
    and(
      eq(pdfSettings.userId, userId),
      eq(pdfSettings.settingType, settingType)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createAnalysisJob(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(videoAnalysisJobs).values(data);
  const result = await db.select().from(videoAnalysisJobs).where(eq(videoAnalysisJobs.id, data.id)).limit(1);
  return result[0];
}
async function getGameAnalysisJob(gameId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(videoAnalysisJobs).where(eq(videoAnalysisJobs.gameId, gameId)).orderBy(desc(videoAnalysisJobs.createdAt)).limit(1);
  return result[0];
}
async function createAnalyzedEvent(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(analyzedEvents).values(data);
  const result = await db.select().from(analyzedEvents).where(eq(analyzedEvents.id, data.id)).limit(1);
  return result[0];
}
async function getGameAnalyzedEvents(gameId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(analyzedEvents).where(eq(analyzedEvents.gameId, gameId)).orderBy(analyzedEvents.timestamp);
  return result;
}
async function updateAnalyzedEvent(eventId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(analyzedEvents).set(data).where(eq(analyzedEvents.id, eventId));
}
async function deleteAnalyzedEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(analyzedEvents).where(eq(analyzedEvents.id, eventId));
}
async function verifyAnalyzedEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(analyzedEvents).set({ verified: true }).where(eq(analyzedEvents.id, eventId));
}

// server/routers.ts
init_storage();
import { randomUUID } from "crypto";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      } else {
        ctx.res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
      }
      return {
        success: true
      };
    })
  }),
  // Teams
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTeamsByUser(ctx.user.id);
    }),
    listAll: protectedProcedure.query(async () => {
      return getAllTeams();
    }),
    get: protectedProcedure.input(z2.object({ id: z2.string() })).query(async ({ input }) => {
      return getTeam(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        name: z2.string(),
        organization: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const team = await createTeam({
        id: randomUUID(),
        name: input.name,
        organization: input.organization || null,
        createdBy: ctx.user.id
      });
      return team;
    })
  }),
  // Players
  players: router({
    listByTeam: protectedProcedure.input(z2.object({ teamId: z2.string() })).query(async ({ input }) => {
      return getPlayersByTeam(input.teamId);
    }),
    get: protectedProcedure.input(z2.object({ id: z2.string() })).query(async ({ input }) => {
      return getPlayer(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        teamId: z2.string(),
        name: z2.string(),
        number: z2.number().optional(),
        position: z2.string().optional(),
        height: z2.number().optional()
      })
    ).mutation(async ({ input }) => {
      const player = await createPlayer({
        id: randomUUID(),
        teamId: input.teamId,
        name: input.name,
        number: input.number ?? null,
        position: input.position || null,
        height: input.height ?? null
      });
      return player;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.string(),
        name: z2.string().optional(),
        number: z2.number().optional(),
        position: z2.string().optional(),
        height: z2.number().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return updatePlayer(id, updates);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.string() })).mutation(async ({ input }) => {
      await deletePlayer(input.id);
      return { success: true };
    })
  }),
  // Games
  games: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getGamesByUser(ctx.user.id);
    }),
    listAll: protectedProcedure.query(async () => {
      return getAllGames();
    }),
    get: protectedProcedure.input(z2.object({ id: z2.string() })).query(async ({ input }) => {
      return getGame(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        homeTeamId: z2.string(),
        awayTeamId: z2.string(),
        gameDate: z2.string(),
        venue: z2.string().optional(),
        videoUrl: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const game = await createGame({
        id: randomUUID(),
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        gameDate: new Date(input.gameDate),
        venue: input.venue || null,
        videoUrl: input.videoUrl || null,
        videoPath: null,
        analysisStatus: "pending",
        createdBy: ctx.user.id
      });
      return game;
    }),
    uploadVideo: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        videoData: z2.string(),
        // base64 encoded
        fileName: z2.string()
      })
    ).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.videoData, "base64");
      const key = `videos/${input.gameId}/${input.fileName}`;
      const { url } = await storagePut(key, buffer, "video/mp4");
      await updateGame(input.gameId, {
        videoPath: url
      });
      return { url };
    }),
    updateAnalysisStatus: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        status: z2.enum(["pending", "processing", "completed", "failed"])
      })
    ).mutation(async ({ input }) => {
      return updateGame(input.gameId, {
        analysisStatus: input.status
      });
    })
  }),
  // Events
  events: router({
    listByGame: protectedProcedure.input(z2.object({ gameId: z2.string() })).query(async ({ input }) => {
      return getEventsByGame(input.gameId);
    }),
    create: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        timestamp: z2.number(),
        period: z2.number(),
        eventType: z2.enum([
          "shot",
          "rebound",
          "assist",
          "turnover",
          "steal",
          "block",
          "foul",
          "substitution"
        ]),
        playerId: z2.string().optional(),
        teamId: z2.string(),
        xCoord: z2.number().optional(),
        yCoord: z2.number().optional(),
        success: z2.boolean().optional(),
        shotType: z2.enum(["2P", "3P", "FT"]).optional(),
        assistedBy: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const event = await createEvent({
        id: randomUUID(),
        gameId: input.gameId,
        timestamp: input.timestamp,
        period: input.period,
        eventType: input.eventType,
        playerId: input.playerId || null,
        teamId: input.teamId,
        xCoord: input.xCoord || null,
        yCoord: input.yCoord || null,
        success: input.success || null,
        shotType: input.shotType || null,
        assistedBy: input.assistedBy || null
      });
      return event;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.string(),
        timestamp: z2.number().optional(),
        period: z2.number().optional(),
        eventType: z2.enum([
          "shot",
          "rebound",
          "assist",
          "turnover",
          "steal",
          "block",
          "foul",
          "substitution"
        ]).optional(),
        playerId: z2.string().optional(),
        xCoord: z2.number().optional(),
        yCoord: z2.number().optional(),
        success: z2.boolean().optional(),
        shotType: z2.enum(["2P", "3P", "FT"]).optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return updateEvent(id, updates);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.string() })).mutation(async ({ input }) => {
      await deleteEvent(input.id);
      return { success: true };
    })
  }),
  // Stats
  stats: router({
    listByGame: protectedProcedure.input(z2.object({ gameId: z2.string() })).query(async ({ input }) => {
      return getStatsByGame(input.gameId);
    }),
    getByGameAndPlayer: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        playerId: z2.string()
      })
    ).query(async ({ input }) => {
      return getStatByGameAndPlayer(input.gameId, input.playerId);
    }),
    create: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        playerId: z2.string(),
        teamId: z2.string(),
        points: z2.number().default(0),
        rebounds: z2.number().default(0),
        assists: z2.number().default(0),
        steals: z2.number().default(0),
        blocks: z2.number().default(0),
        turnovers: z2.number().default(0),
        fgm: z2.number().default(0),
        fga: z2.number().default(0),
        fg3m: z2.number().default(0),
        fg3a: z2.number().default(0),
        ftm: z2.number().default(0),
        fta: z2.number().default(0)
      })
    ).mutation(async ({ input }) => {
      const stat = await createStat({
        id: randomUUID(),
        ...input
      });
      return stat;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.string(),
        points: z2.number().optional(),
        rebounds: z2.number().optional(),
        assists: z2.number().optional(),
        steals: z2.number().optional(),
        blocks: z2.number().optional(),
        turnovers: z2.number().optional(),
        fgm: z2.number().optional(),
        fga: z2.number().optional(),
        fg3m: z2.number().optional(),
        fg3a: z2.number().optional(),
        ftm: z2.number().optional(),
        fta: z2.number().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return updateStat(id, updates);
    })
  }),
  // Playlists
  playlists: router({
    listByGame: protectedProcedure.input(z2.object({ gameId: z2.string() })).query(async ({ input }) => {
      return getPlaylistsByGame(input.gameId);
    }),
    get: protectedProcedure.input(z2.object({ id: z2.string() })).query(async ({ input }) => {
      return getPlaylist(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        name: z2.string(),
        description: z2.string().optional(),
        filterType: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const playlist = await createPlaylist({
        id: randomUUID(),
        gameId: input.gameId,
        name: input.name,
        description: input.description || null,
        filterType: input.filterType || null,
        videoPath: null,
        createdBy: ctx.user.id
      });
      return playlist;
    }),
    getEvents: protectedProcedure.input(z2.object({ playlistId: z2.string() })).query(async ({ input }) => {
      return getPlaylistEventsByPlaylist(input.playlistId);
    }),
    addEvent: protectedProcedure.input(
      z2.object({
        playlistId: z2.string(),
        eventId: z2.string(),
        sequenceOrder: z2.number()
      })
    ).mutation(async ({ input }) => {
      const playlistEvent = await createPlaylistEvent({
        id: randomUUID(),
        playlistId: input.playlistId,
        eventId: input.eventId,
        sequenceOrder: input.sequenceOrder
      });
      return playlistEvent;
    })
  }),
  // Lineups
  lineups: router({
    listByGame: protectedProcedure.input(z2.object({ gameId: z2.string() })).query(async ({ input }) => {
      return getLineupsByGame(input.gameId);
    }),
    create: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        teamId: z2.string(),
        period: z2.number(),
        startTime: z2.number(),
        endTime: z2.number(),
        player1Id: z2.string(),
        player2Id: z2.string(),
        player3Id: z2.string(),
        player4Id: z2.string(),
        player5Id: z2.string(),
        pointsScored: z2.number().default(0),
        pointsAllowed: z2.number().default(0)
      })
    ).mutation(async ({ input }) => {
      const lineup = await createLineup({
        id: randomUUID(),
        ...input
      });
      return lineup;
    })
  }),
  // PDF Settings
  pdfSettings: router({
    save: protectedProcedure.input(z2.object({
      settingType: z2.string(),
      sections: z2.object({
        playerTendencies: z2.boolean().optional(),
        setPlays: z2.boolean().optional(),
        blobSlob: z2.boolean().optional(),
        teamStrategy: z2.boolean().optional(),
        keyMatchups: z2.boolean().optional()
      })
    })).mutation(async ({ ctx, input }) => {
      const id = `${ctx.user.id}-${input.settingType}`;
      await savePdfSetting({
        id,
        userId: ctx.user.id,
        settingType: input.settingType,
        sections: JSON.stringify(input.sections)
      });
      return { success: true };
    }),
    get: protectedProcedure.input(z2.object({ settingType: z2.string() })).query(async ({ ctx, input }) => {
      const setting = await getPdfSetting(ctx.user.id, input.settingType);
      if (!setting) return null;
      return {
        ...setting,
        sections: JSON.parse(setting.sections)
      };
    })
  }),
  // PDF Export
  pdf: router({
    generateSetPlayReport: protectedProcedure.input(z2.object({ gameId: z2.string() })).mutation(async ({ input }) => {
      return { success: true, url: "/reports/setplay-report.pdf" };
    }),
    generateTacticalPlan: protectedProcedure.input(z2.object({ gameId: z2.string() })).mutation(async ({ input }) => {
      return { success: true, url: "/reports/tactical-plan.pdf" };
    }),
    generateScoutingReport: protectedProcedure.input(z2.object({
      gameId: z2.string(),
      sections: z2.object({
        playerTendencies: z2.boolean().optional(),
        setPlays: z2.boolean().optional(),
        blobSlob: z2.boolean().optional(),
        teamStrategy: z2.boolean().optional(),
        keyMatchups: z2.boolean().optional()
      }).optional()
    })).mutation(async ({ input }) => {
      const game = await getGame(input.gameId);
      if (!game) {
        throw new Error("Game not found");
      }
      const homeTeam = await getTeam(game.homeTeamId);
      const awayTeam = await getTeam(game.awayTeamId);
      if (!homeTeam || !awayTeam) {
        throw new Error("Teams not found");
      }
      const { generateScoutingReportPDF: generateScoutingReportPDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const url = await generateScoutingReportPDF2(
        game,
        homeTeam,
        awayTeam,
        input.sections || {}
      );
      return { success: true, url };
    })
  }),
  // Video Analysis
  videoAnalysis: router({
    // 解析ジョブを作成
    createJob: protectedProcedure.input(
      z2.object({
        gameId: z2.string()
      })
    ).mutation(async ({ input, ctx }) => {
      const jobId = randomUUID();
      const job = await createAnalysisJob({
        id: jobId,
        gameId: input.gameId,
        status: "queued",
        progress: 0
      });
      await updateGame(input.gameId, {
        analysisStatus: "processing"
      });
      return job;
    }),
    // 解析ジョブのステータスを取得
    getJobStatus: protectedProcedure.input(
      z2.object({
        gameId: z2.string()
      })
    ).query(async ({ input }) => {
      const job = await getGameAnalysisJob(input.gameId);
      return job;
    }),
    // ゲームのイベント一覧を取得
    getGameEvents: protectedProcedure.input(
      z2.object({
        gameId: z2.string()
      })
    ).query(async ({ input }) => {
      const events2 = await getGameAnalyzedEvents(input.gameId);
      return events2;
    }),
    // 手動でイベントを作成
    createManualEvent: protectedProcedure.input(
      z2.object({
        gameId: z2.string(),
        timestamp: z2.number(),
        eventType: z2.enum([
          "shot",
          "rebound",
          "assist",
          "turnover",
          "steal",
          "block",
          "foul",
          "substitution"
        ]),
        playerId: z2.string().optional(),
        playerNumber: z2.number().optional(),
        teamId: z2.string(),
        xCoord: z2.number().optional(),
        yCoord: z2.number().optional(),
        success: z2.boolean().optional(),
        shotType: z2.enum(["2P", "3P", "FT"]).optional(),
        assistedBy: z2.string().optional(),
        description: z2.string()
      })
    ).mutation(async ({ input }) => {
      const event = await createAnalyzedEvent({
        id: randomUUID(),
        gameId: input.gameId,
        jobId: "manual",
        // 手動イベントの場合は "manual"
        timestamp: input.timestamp,
        eventType: input.eventType,
        playerId: input.playerId || null,
        playerNumber: input.playerNumber ?? null,
        teamId: input.teamId,
        xCoord: input.xCoord ?? null,
        yCoord: input.yCoord ?? null,
        success: input.success ?? null,
        shotType: input.shotType || null,
        assistedBy: input.assistedBy || null,
        confidence: 1,
        // 手動イベントは信頼度100%
        description: input.description,
        rawData: null,
        verified: true
        // 手動イベントは自動的に検証済み
      });
      return event;
    }),
    // イベントを更新
    updateEvent: protectedProcedure.input(
      z2.object({
        id: z2.string(),
        timestamp: z2.number().optional(),
        eventType: z2.enum([
          "shot",
          "rebound",
          "assist",
          "turnover",
          "steal",
          "block",
          "foul",
          "substitution"
        ]).optional(),
        playerId: z2.string().optional(),
        playerNumber: z2.number().optional(),
        teamId: z2.string().optional(),
        xCoord: z2.number().optional(),
        yCoord: z2.number().optional(),
        success: z2.boolean().optional(),
        shotType: z2.enum(["2P", "3P", "FT"]).optional(),
        description: z2.string().optional(),
        verified: z2.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      await updateAnalyzedEvent(id, updateData);
      return { success: true };
    }),
    // イベントを削除
    deleteEvent: protectedProcedure.input(
      z2.object({
        id: z2.string()
      })
    ).mutation(async ({ input }) => {
      await deleteAnalyzedEvent(input.id);
      return { success: true };
    }),
    // イベントを検証済みにマーク
    verifyEvent: protectedProcedure.input(
      z2.object({
        id: z2.string()
      })
    ).mutation(async ({ input }) => {
      await verifyAnalyzedEvent(input.id);
      return { success: true };
    })
  })
});

// server/supabase.ts
init_env();
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = ENV.supabaseUrl;
var supabaseAnonKey = ENV.supabaseAnonKey;
var supabaseAdmin = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn("Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY), authentication will not work");
}

// server/_core/supabaseContext.ts
async function createSupabaseContext(opts) {
  let user = null;
  try {
    if (!supabaseAdmin) {
      console.warn("[Auth] Supabase not configured");
      return {
        req: opts.req,
        res: opts.res,
        user: null
      };
    }
    const authHeader = opts.req.headers?.authorization || opts.req.headers?.["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !supabaseUser) {
        console.warn("[Auth] Invalid token:", error?.message);
        user = null;
      } else {
        user = await getUser(supabaseUser.id) ?? null;
        if (!user) {
          await upsertUser({
            id: supabaseUser.id,
            email: supabaseUser.email ?? null,
            name: supabaseUser.user_metadata?.name ?? null,
            loginMethod: "email",
            lastSignedIn: /* @__PURE__ */ new Date()
          });
          user = await getUser(supabaseUser.id) ?? null;
        } else {
          await upsertUser({
            id: user.id,
            lastSignedIn: /* @__PURE__ */ new Date()
          });
        }
      }
    }
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/context.ts
async function createContext(opts) {
  return createSupabaseContext(opts);
}

// api/_index.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const url = new URL(req.url || "", `https://${req.headers.host}`);
  const fetchRequest = new Request(url.toString(), {
    method: req.method || "GET",
    headers: new Headers(req.headers),
    body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : void 0
  });
  const fetchResponse = await fetchRequestHandler({
    req: fetchRequest,
    router: appRouter,
    endpoint: "/api/trpc",
    createContext: () => createContext({ req, res })
  });
  res.status(fetchResponse.status);
  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = await fetchResponse.text();
  res.send(body);
}
export {
  handler as default
};
