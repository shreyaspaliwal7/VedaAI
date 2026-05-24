import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: requireEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/vedaai"),
  redisUrl: requireEnv("REDIS_URL", "redis://127.0.0.1:6379"),
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
};
