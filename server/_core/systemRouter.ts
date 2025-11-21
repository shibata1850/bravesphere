import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

// Helper function to mask sensitive connection string data
function maskConnectionString(str: string): string {
  if (!str) return "not set";
  // Mask password and show only hostname/port info
  const match = str.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)(\/.*)?/);
  if (match) {
    const [, username, , hostPort, database] = match;
    return `postgresql://${username}:***@${hostPort}${database || ""}`;
  }
  return "***";
}

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  // Diagnostic endpoint to check environment configuration
  diagnostics: publicProcedure.query(() => {
    const databaseUrl = process.env.DATABASE_URL;
    const host = databaseUrl?.split("@")[1]?.split("/")[0] || "not found";

    return {
      environment: process.env.NODE_ENV || "not set",
      databaseUrl: maskConnectionString(databaseUrl || ""),
      databaseHost: host,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      timestamp: new Date().toISOString(),
    };
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
