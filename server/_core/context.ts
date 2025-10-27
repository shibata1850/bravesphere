import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createSupabaseContext } from "./supabaseContext";

export type { TrpcContext } from "./supabaseContext";

export async function createContext(
  opts: CreateExpressContextOptions
) {
  return createSupabaseContext(opts);
}

