import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
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

    // Get authorization header
    const authHeader = opts.req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !supabaseUser) {
        console.warn('[Auth] Invalid token:', error?.message);
        user = null;
      } else {
        // Get or create user in our database
          user = await db.getUser(supabaseUser.id) ?? null;
        
        if (!user) {
          // Create user if doesn't exist
          await db.upsertUser({
            id: supabaseUser.id,
            email: supabaseUser.email ?? null,
            name: supabaseUser.user_metadata?.name ?? null,
            loginMethod: 'email',
            lastSignedIn: new Date(),
          });
          user = await db.getUser(supabaseUser.id) ?? null;
        } else {
          // Update last signed in
          await db.upsertUser({
            id: user.id,
            lastSignedIn: new Date(),
          });
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

