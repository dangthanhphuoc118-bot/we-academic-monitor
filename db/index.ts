import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Check that wrangler.jsonc uses the binding name DB and the correct database_id."
    );
  }

  return drizzle(env.DB, { schema });
}
