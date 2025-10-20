import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { randomUUID } from "crypto";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Teams
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTeamsByUser(ctx.user.id);
    }),

    listAll: protectedProcedure.query(async () => {
      return db.getAllTeams();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getTeam(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          organization: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const team = await db.createTeam({
          id: randomUUID(),
          name: input.name,
          organization: input.organization || null,
          createdBy: ctx.user.id,
        });
        return team;
      }),
  }),

  // Players
  players: router({
    listByTeam: protectedProcedure
      .input(z.object({ teamId: z.string() }))
      .query(async ({ input }) => {
        return db.getPlayersByTeam(input.teamId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getPlayer(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          teamId: z.string(),
          name: z.string(),
          number: z.number().optional(),
          position: z.string().optional(),
          height: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const player = await db.createPlayer({
          id: randomUUID(),
          teamId: input.teamId,
          name: input.name,
          number: input.number ?? null,
          position: input.position || null,
          height: input.height ?? null,
        });
        return player;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          number: z.number().optional(),
          position: z.string().optional(),
          height: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updatePlayer(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deletePlayer(input.id);
        return { success: true };
      }),
  }),

  // Games
  games: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getGamesByUser(ctx.user.id);
    }),

    listAll: protectedProcedure.query(async () => {
      return db.getAllGames();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getGame(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          homeTeamId: z.string(),
          awayTeamId: z.string(),
          gameDate: z.string(),
          venue: z.string().optional(),
          videoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const game = await db.createGame({
          id: randomUUID(),
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          gameDate: new Date(input.gameDate),
          venue: input.venue || null,
          videoUrl: input.videoUrl || null,
          videoPath: null,
          analysisStatus: "pending",
          createdBy: ctx.user.id,
        });
        return game;
      }),

    uploadVideo: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          videoData: z.string(), // base64 encoded
          fileName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.videoData, "base64");

        // Upload to S3
        const key = `videos/${input.gameId}/${input.fileName}`;
        const { url } = await storagePut(key, buffer, "video/mp4");

        // Update game with video path
        await db.updateGame(input.gameId, {
          videoPath: url,
        });

        return { url };
      }),

    updateAnalysisStatus: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          status: z.enum(["pending", "processing", "completed", "failed"]),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateGame(input.gameId, {
          analysisStatus: input.status,
        });
      }),
  }),

  // Events
  events: router({
    listByGame: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .query(async ({ input }) => {
        return db.getEventsByGame(input.gameId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          timestamp: z.number(),
          period: z.number(),
          eventType: z.enum([
            "shot",
            "rebound",
            "assist",
            "turnover",
            "steal",
            "block",
            "foul",
            "substitution",
          ]),
          playerId: z.string().optional(),
          teamId: z.string(),
          xCoord: z.number().optional(),
          yCoord: z.number().optional(),
          success: z.boolean().optional(),
          shotType: z.enum(["2P", "3P", "FT"]).optional(),
          assistedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const event = await db.createEvent({
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
          assistedBy: input.assistedBy || null,
        });
        return event;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          timestamp: z.number().optional(),
          period: z.number().optional(),
          eventType: z
            .enum([
              "shot",
              "rebound",
              "assist",
              "turnover",
              "steal",
              "block",
              "foul",
              "substitution",
            ])
            .optional(),
          playerId: z.string().optional(),
          xCoord: z.number().optional(),
          yCoord: z.number().optional(),
          success: z.boolean().optional(),
          shotType: z.enum(["2P", "3P", "FT"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateEvent(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // Stats
  stats: router({
    listByGame: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .query(async ({ input }) => {
        return db.getStatsByGame(input.gameId);
      }),

    getByGameAndPlayer: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          playerId: z.string(),
        })
      )
      .query(async ({ input }) => {
        return db.getStatByGameAndPlayer(input.gameId, input.playerId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          playerId: z.string(),
          teamId: z.string(),
          points: z.number().default(0),
          rebounds: z.number().default(0),
          assists: z.number().default(0),
          steals: z.number().default(0),
          blocks: z.number().default(0),
          turnovers: z.number().default(0),
          fgm: z.number().default(0),
          fga: z.number().default(0),
          fg3m: z.number().default(0),
          fg3a: z.number().default(0),
          ftm: z.number().default(0),
          fta: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const stat = await db.createStat({
          id: randomUUID(),
          ...input,
        });
        return stat;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          points: z.number().optional(),
          rebounds: z.number().optional(),
          assists: z.number().optional(),
          steals: z.number().optional(),
          blocks: z.number().optional(),
          turnovers: z.number().optional(),
          fgm: z.number().optional(),
          fga: z.number().optional(),
          fg3m: z.number().optional(),
          fg3a: z.number().optional(),
          ftm: z.number().optional(),
          fta: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateStat(id, updates);
      }),
  }),

  // Playlists
  playlists: router({
    listByGame: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .query(async ({ input }) => {
        return db.getPlaylistsByGame(input.gameId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getPlaylist(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          filterType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const playlist = await db.createPlaylist({
          id: randomUUID(),
          gameId: input.gameId,
          name: input.name,
          description: input.description || null,
          filterType: input.filterType || null,
          videoPath: null,
          createdBy: ctx.user.id,
        });
        return playlist;
      }),

    getEvents: protectedProcedure
      .input(z.object({ playlistId: z.string() }))
      .query(async ({ input }) => {
        return db.getPlaylistEventsByPlaylist(input.playlistId);
      }),

    addEvent: protectedProcedure
      .input(
        z.object({
          playlistId: z.string(),
          eventId: z.string(),
          sequenceOrder: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const playlistEvent = await db.createPlaylistEvent({
          id: randomUUID(),
          playlistId: input.playlistId,
          eventId: input.eventId,
          sequenceOrder: input.sequenceOrder,
        });
        return playlistEvent;
      }),
  }),

  // Lineups
  lineups: router({
    listByGame: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .query(async ({ input }) => {
        return db.getLineupsByGame(input.gameId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          gameId: z.string(),
          teamId: z.string(),
          period: z.number(),
          startTime: z.number(),
          endTime: z.number(),
          player1Id: z.string(),
          player2Id: z.string(),
          player3Id: z.string(),
          player4Id: z.string(),
          player5Id: z.string(),
          pointsScored: z.number().default(0),
          pointsAllowed: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const lineup = await db.createLineup({
          id: randomUUID(),
          ...input,
        });
        return lineup;
      }),
  }),

  // PDF Settings
  pdfSettings: router({
    save: protectedProcedure
      .input(z.object({
        settingType: z.string(),
        sections: z.object({
          playerTendencies: z.boolean().optional(),
          setPlays: z.boolean().optional(),
          blobSlob: z.boolean().optional(),
          teamStrategy: z.boolean().optional(),
          keyMatchups: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = `${ctx.user.id}-${input.settingType}`;
        await db.savePdfSetting({
          id,
          userId: ctx.user.id,
          settingType: input.settingType,
          sections: JSON.stringify(input.sections),
        });
        return { success: true };
      }),
    get: protectedProcedure
      .input(z.object({ settingType: z.string() }))
      .query(async ({ ctx, input }) => {
        const setting = await db.getPdfSetting(ctx.user.id, input.settingType);
        if (!setting) return null;
        return {
          ...setting,
          sections: JSON.parse(setting.sections),
        };
      }),
  }),

  // PDF Export
  pdf: router({
    generateSetPlayReport: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .mutation(async ({ input }) => {
        // PDF生成ロジック（後で実装）
        return { success: true, url: "/reports/setplay-report.pdf" };
      }),
    generateTacticalPlan: protectedProcedure
      .input(z.object({ gameId: z.string() }))
      .mutation(async ({ input }) => {
        // 戦術案PDF生成ロジック
        return { success: true, url: "/reports/tactical-plan.pdf" };
      }),
    generateScoutingReport: protectedProcedure
      .input(z.object({ 
        gameId: z.string(),
        sections: z.object({
          playerTendencies: z.boolean().optional(),
          setPlays: z.boolean().optional(),
          blobSlob: z.boolean().optional(),
          teamStrategy: z.boolean().optional(),
          keyMatchups: z.boolean().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        // 試合とチーム情報を取得
        const game = await db.getGame(input.gameId);
        if (!game) {
          throw new Error("Game not found");
        }
        
        const homeTeam = await db.getTeam(game.homeTeamId);
        const awayTeam = await db.getTeam(game.awayTeamId);
        
        if (!homeTeam || !awayTeam) {
          throw new Error("Teams not found");
        }
        
        // PDF生成
        const { generateScoutingReportPDF } = await import("./pdfGenerator");
        const url = await generateScoutingReportPDF(
          game,
          homeTeam,
          awayTeam,
          input.sections || {}
        );
        
        return { success: true, url };
      }),
  }),
});

export type AppRouter = typeof appRouter;

