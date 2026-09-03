import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Non-pooled connection for migrations (Neon: *_UNPOOLED).
    url: (process.env.DATABASE_URL_UNPOOLED ||
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL)!,
  },
  verbose: true,
  strict: true,
});
