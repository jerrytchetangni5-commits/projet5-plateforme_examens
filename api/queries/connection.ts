import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/uniresults.db",
});

export const db = drizzle(client, { schema: fullSchema });

export function getDb() {
  return db;
}
