import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  SUPABASE_URL: z.string().url(),

  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),

  SUPABASE_SECRET_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.treeifyError(parsedEnv.error),
  );

  process.exit(1);
}

export const env = parsedEnv.data;