import "server-only";
import { createHash } from "crypto";
import connectDB from "@/lib/mongoose";
import RateLimit from "@/models/RateLimit";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

let modelReady: Promise<unknown> | null = null;

function rateLimitKey(scope: string, identity: string) {
  const digest = createHash("sha256").update(`${scope}\0${identity.toLowerCase()}`).digest("hex");
  return `${scope.slice(0, 64)}:${digest}`;
}

export async function consumeRateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  await connectDB();
  modelReady ??= RateLimit.init();
  await modelReady;
  const key = rateLimitKey(scope, identity);
  const now = new Date();
  const nextReset = new Date(now.getTime() + windowMs);

  const active = await RateLimit.findOneAndUpdate(
    { key, resetAt: { $gt: now }, count: { $lt: limit } },
    { $inc: { count: 1 } },
    { new: true },
  ).select("resetAt");

  if (active) {
    return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((active.resetAt.getTime() - now.getTime()) / 1000)) };
  }

  const reset = await RateLimit.findOneAndUpdate(
    { key, $or: [{ resetAt: { $lte: now } }, { resetAt: { $exists: false } }] },
    { $set: { count: 1, resetAt: nextReset } },
    { new: true, upsert: false },
  ).select("resetAt");

  if (reset) return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };

  try {
    await RateLimit.create({ key, count: 1, resetAt: nextReset });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  } catch (error: unknown) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
  }

  const blocked = await RateLimit.findOne({ key }).select("resetAt");
  const retryAfterSeconds = blocked
    ? Math.max(1, Math.ceil((blocked.resetAt.getTime() - now.getTime()) / 1000))
    : Math.ceil(windowMs / 1000);
  return { allowed: false, retryAfterSeconds };
}

export async function clearRateLimit(scope: string, identity: string) {
  await connectDB();
  modelReady ??= RateLimit.init();
  await modelReady;
  await RateLimit.deleteOne({ key: rateLimitKey(scope, identity) });
}
