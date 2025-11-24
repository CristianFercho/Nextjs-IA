// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "Falta OPENAI_API_KEY en .env.local"),
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});