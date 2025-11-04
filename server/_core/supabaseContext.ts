import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "../../drizzle/schema";
import { supabaseAdmin } from "../supabase";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createSupabaseContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const buildUserFromSupabase = (supabaseUser: SupabaseAuthUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    name: (supabaseUser.user_metadata?.name as string | undefined) ?? null,
    loginMethod:
      (supabaseUser.app_metadata?.provider as string | undefined) ?? "email",
    role: "user",
    createdAt: new Date(),
    lastSignedIn: new Date(),
  });

  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.warn('[Auth] Supabase not configured');
      return {
        req: opts.req,
        res: opts.res,
        user: null,
      };
    }

    // Get authorization header (handle both Express and Vercel types)
    const authHeader = opts.req.headers?.authorization || opts.req.headers?.['authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !supabaseUser) {
        console.warn('[Auth] Invalid token:', error?.message);
        user = null;
      } else {
        // Get or create user in our database
        try {
          user = (await db.getUser(supabaseUser.id)) ?? null;
        } catch (dbError) {
          console.warn('[Auth] Failed to read user from database:', dbError);
          user = null;
        }

        if (!user) {
          try {
            await db.upsertUser({
              id: supabaseUser.id,
              email: supabaseUser.email ?? null,
              name: supabaseUser.user_metadata?.name ?? null,
              loginMethod:
                (supabaseUser.app_metadata?.provider as string | undefined) ??
                'email',
              lastSignedIn: new Date(),
            });
            user = (await db.getUser(supabaseUser.id)) ?? null;
          } catch (dbError) {
            console.warn('[Auth] Failed to upsert user in database:', dbError);
            user = null;
          }
        } else {
          try {
            await db.upsertUser({
              id: user.id,
              lastSignedIn: new Date(),
            });
          } catch (dbError) {
            console.warn('[Auth] Failed to update user sign-in timestamp:', dbError);
          }
        }

        if (!user) {
          user = buildUserFromSupabase(supabaseUser);
        }
      }
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

