import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  teams,
  InsertTeam,
  Team,
  players,
  InsertPlayer,
  Player,
  games,
  InsertGame,
  Game,
  events,
  InsertEvent,
  Event,
  stats,
  InsertStat,
  Stat,
  lineups,
  InsertLineup,
  Lineup,
  playlists,
  InsertPlaylist,
  Playlist,
  playlistEvents,
  InsertPlaylistEvent,
  PlaylistEvent,
  pdfSettings,
  InsertPdfSetting,
  PdfSetting,
  videoAnalysisJobs,
  InsertVideoAnalysisJob,
  VideoAnalysisJob,
  videoTrackingData,
  InsertVideoTrackingData,
  VideoTrackingData,
  analyzedEvents,
  InsertAnalyzedEvent,
  AnalyzedEvent,
  videoKeyFrames,
  InsertVideoKeyFrame,
  VideoKeyFrame,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function maskConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      return connectionString.replace(url.password, "***");
    }
  } catch (error) {
    console.warn("[Database] Failed to mask connection string:", error);
  }
  return connectionString;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) {
    return _db;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[Database] DATABASE_URL is not set");
    return null;
  }

  // Accept postgres:// or postgresql:// schemes (Supabase uses these)
  if (!connectionString.startsWith("postgres")) {
    console.warn(
      `[Database] Unsupported DATABASE_URL scheme. Expected postgres-compatible connection string but received ${maskConnectionString(connectionString)}`,
    );
    return null;
  }

  try {
    if (!_client) {
      console.log("[Database] Creating new PostgreSQL client...");
      console.log("[Database] Host:", maskConnectionString(connectionString));

      _client = postgres(connectionString, {
        max: ENV.isProduction ? 1 : 5,
        idle_timeout: 20,
        connect_timeout: 30,
        ssl: { rejectUnauthorized: false }, // Required for Supabase pooler
        prepare: false, // Required for Supabase Transaction mode (pgbouncer)
        connection: {
          application_name: "bravesphere",
        },
      });

      console.log("[Database] PostgreSQL client created successfully");
    }

    _db = drizzle(_client);
  } catch (error) {
    console.error("[Database] Failed to create client:", error);
    _client = null;
    _db = null;
  }

  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.id,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Teams ==========

export async function createTeam(team: InsertTeam): Promise<Team> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(teams).values(team);
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.id, team.id!))
    .limit(1);
  return result[0];
}

export async function getTeam(id: string): Promise<Team | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTeamsByUser(userId: string): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(teams).where(eq(teams.createdBy, userId));
}

export async function getAllTeams(): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(teams).orderBy(desc(teams.createdAt));
}

// ========== Players ==========

export async function createPlayer(player: InsertPlayer): Promise<Player> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(players).values(player);
  const result = await db
    .select()
    .from(players)
    .where(eq(players.id, player.id!))
    .limit(1);
  return result[0];
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(players).where(eq(players.teamId, teamId));
}

export async function updatePlayer(
  id: string,
  updates: Partial<InsertPlayer>
): Promise<Player | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(players).set(updates).where(eq(players.id, id));
  return getPlayer(id);
}

export async function deletePlayer(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(players).where(eq(players.id, id));
}

// ========== Games ==========

export async function createGame(game: InsertGame): Promise<Game> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(games).values(game);
  const result = await db
    .select()
    .from(games)
    .where(eq(games.id, game.id!))
    .limit(1);
  return result[0];
}

export async function getGame(id: string): Promise<Game | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGamesByUser(userId: string): Promise<Game[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(games)
    .where(eq(games.createdBy, userId))
    .orderBy(desc(games.gameDate));
}

export async function getAllGames(): Promise<Game[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(games).orderBy(desc(games.gameDate));
}

export async function updateGame(
  id: string,
  updates: Partial<InsertGame>
): Promise<Game | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(games).set(updates).where(eq(games.id, id));
  return getGame(id);
}

// ========== Events ==========

export async function createEvent(event: InsertEvent): Promise<Event> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(events).values(event);
  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, event.id!))
    .limit(1);
  return result[0];
}

export async function getEventsByGame(gameId: string): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(events)
    .where(eq(events.gameId, gameId))
    .orderBy(events.timestamp);
}

export async function updateEvent(
  id: string,
  updates: Partial<InsertEvent>
): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(events).set(updates).where(eq(events.id, id));
  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(events).where(eq(events.id, id));
}

// ========== Stats ==========

export async function createStat(stat: InsertStat): Promise<Stat> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(stats).values(stat);
  const result = await db
    .select()
    .from(stats)
    .where(eq(stats.id, stat.id!))
    .limit(1);
  return result[0];
}

export async function getStatsByGame(gameId: string): Promise<Stat[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(stats).where(eq(stats.gameId, gameId));
}

export async function getStatByGameAndPlayer(
  gameId: string,
  playerId: string
): Promise<Stat | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stats)
    .where(and(eq(stats.gameId, gameId), eq(stats.playerId, playerId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStat(
  id: string,
  updates: Partial<InsertStat>
): Promise<Stat | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(stats).set(updates).where(eq(stats.id, id));
  const result = await db.select().from(stats).where(eq(stats.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Lineups ==========

export async function createLineup(lineup: InsertLineup): Promise<Lineup> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(lineups).values(lineup);
  const result = await db
    .select()
    .from(lineups)
    .where(eq(lineups.id, lineup.id!))
    .limit(1);
  return result[0];
}

export async function getLineupsByGame(gameId: string): Promise<Lineup[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(lineups).where(eq(lineups.gameId, gameId));
}

// ========== Playlists ==========

export async function createPlaylist(
  playlist: InsertPlaylist
): Promise<Playlist> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(playlists).values(playlist);
  const result = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlist.id!))
    .limit(1);
  return result[0];
}

export async function getPlaylist(id: string): Promise<Playlist | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPlaylistsByGame(gameId: string): Promise<Playlist[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(playlists).where(eq(playlists.gameId, gameId));
}

// ========== PlaylistEvents ==========

export async function createPlaylistEvent(
  playlistEvent: InsertPlaylistEvent
): Promise<PlaylistEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(playlistEvents).values(playlistEvent);
  const result = await db
    .select()
    .from(playlistEvents)
    .where(eq(playlistEvents.id, playlistEvent.id!))
    .limit(1);
  return result[0];
}

export async function getPlaylistEventsByPlaylist(
  playlistId: string
): Promise<PlaylistEvent[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playlistEvents)
    .where(eq(playlistEvents.playlistId, playlistId))
    .orderBy(playlistEvents.sequenceOrder);
}


// PDF Settings
export async function savePdfSetting(setting: InsertPdfSetting) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(pdfSettings).values(setting).onConflictDoUpdate({
    target: pdfSettings.id,
    set: {
      sections: setting.sections,
      updatedAt: new Date(),
    },
  });
  return result;
}

export async function getPdfSetting(userId: string, settingType: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(pdfSettings)
    .where(
      and(
        eq(pdfSettings.userId, userId),
        eq(pdfSettings.settingType, settingType)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}



// ==========================================
// Video Analysis Functions
// ==========================================

/**
 * 解析ジョブを作成
 */
export async function createAnalysisJob(
  data: InsertVideoAnalysisJob
): Promise<VideoAnalysisJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(videoAnalysisJobs).values(data);

  const result = await db
    .select()
    .from(videoAnalysisJobs)
    .where(eq(videoAnalysisJobs.id, data.id))
    .limit(1);

  return result[0];
}

/**
 * 解析ジョブのステータスを更新
 */
export async function updateAnalysisJobStatus(
  jobId: string,
  status: "queued" | "downloading" | "analyzing_video" | "analyzing_events" | "completed" | "failed",
  progress?: number,
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { status };

  if (progress !== undefined) {
    updateData.progress = progress;
  }

  if (errorMessage !== undefined) {
    updateData.errorMessage = errorMessage;
  }

  if (status === "completed" || status === "failed") {
    updateData.completedAt = new Date();
  }

  await db
    .update(videoAnalysisJobs)
    .set(updateData)
    .where(eq(videoAnalysisJobs.id, jobId));
}

/**
 * 解析ジョブを取得
 */
export async function getAnalysisJob(jobId: string): Promise<VideoAnalysisJob | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(videoAnalysisJobs)
    .where(eq(videoAnalysisJobs.id, jobId))
    .limit(1);

  return result[0];
}

/**
 * ゲームの解析ジョブを取得
 */
export async function getGameAnalysisJob(gameId: string): Promise<VideoAnalysisJob | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(videoAnalysisJobs)
    .where(eq(videoAnalysisJobs.gameId, gameId))
    .orderBy(desc(videoAnalysisJobs.createdAt))
    .limit(1);

  return result[0];
}

/**
 * 追跡データを保存
 */
export async function saveTrackingData(
  data: InsertVideoTrackingData
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(videoTrackingData).values(data);
}

/**
 * ゲームの追跡データを取得
 */
export async function getGameTrackingData(
  gameId: string,
  dataType?: "object_tracking" | "text_detection" | "shot_detection" | "label_detection"
): Promise<VideoTrackingData[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (dataType) {
    const result = await db
      .select()
      .from(videoTrackingData)
      .where(and(
        eq(videoTrackingData.gameId, gameId),
        eq(videoTrackingData.dataType, dataType)
      ))
      .orderBy(videoTrackingData.timestamp);
    return result;
  } else {
    const result = await db
      .select()
      .from(videoTrackingData)
      .where(eq(videoTrackingData.gameId, gameId))
      .orderBy(videoTrackingData.timestamp);
    return result;
  }
}

/**
 * 解析イベントを作成
 */
export async function createAnalyzedEvent(
  data: InsertAnalyzedEvent
): Promise<AnalyzedEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(analyzedEvents).values(data);

  const result = await db
    .select()
    .from(analyzedEvents)
    .where(eq(analyzedEvents.id, data.id))
    .limit(1);

  return result[0];
}

/**
 * ゲームの解析イベントを取得
 */
export async function getGameAnalyzedEvents(gameId: string): Promise<AnalyzedEvent[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(analyzedEvents)
    .where(eq(analyzedEvents.gameId, gameId))
    .orderBy(analyzedEvents.timestamp);

  return result;
}

/**
 * 解析イベントを更新
 */
export async function updateAnalyzedEvent(
  eventId: string,
  data: Partial<InsertAnalyzedEvent>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(analyzedEvents)
    .set(data)
    .where(eq(analyzedEvents.id, eventId));
}

/**
 * 解析イベントを削除
 */
export async function deleteAnalyzedEvent(eventId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(analyzedEvents)
    .where(eq(analyzedEvents.id, eventId));
}

/**
 * 解析イベントを検証済みにマーク
 */
export async function verifyAnalyzedEvent(eventId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(analyzedEvents)
    .set({ verified: true })
    .where(eq(analyzedEvents.id, eventId));
}

/**
 * キーフレームを保存
 */
export async function saveKeyFrame(
  data: InsertVideoKeyFrame
): Promise<VideoKeyFrame> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(videoKeyFrames).values(data);

  const result = await db
    .select()
    .from(videoKeyFrames)
    .where(eq(videoKeyFrames.id, data.id))
    .limit(1);

  return result[0];
}

/**
 * ゲームのキーフレームを取得
 */
export async function getGameKeyFrames(gameId: string): Promise<VideoKeyFrame[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(videoKeyFrames)
    .where(eq(videoKeyFrames.gameId, gameId))
    .orderBy(videoKeyFrames.timestamp);

  return result;
}
