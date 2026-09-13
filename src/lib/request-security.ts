import "server-only";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isRecord, type UnknownRecord } from "@/lib/validation";
import { MAX_JSON_BODY_BYTES } from "@/lib/security-validation";

type JsonResult =
  | { ok: true; data: UnknownRecord }
  | { ok: false; response: NextResponse };

export function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (request.headers.get("x-real-ip") ?? forwarded ?? "unknown").slice(0, 128);
}

export function requireSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const expectedHost = forwardedHost || requestUrl.host;
    const expectedProtocol = forwardedProto ? `${forwardedProto}:` : requestUrl.protocol;

    if (originUrl.host !== expectedHost || originUrl.protocol !== expectedProtocol) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function readJsonObject(request: Request, maxBytes = MAX_JSON_BODY_BYTES): Promise<JsonResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return { ok: false, response: NextResponse.json({ message: "Content-Type must be application/json" }, { status: 415 }) };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, response: NextResponse.json({ message: "Request body is too large" }, { status: 413 }) };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return { ok: false, response: NextResponse.json({ message: "Invalid request body" }, { status: 400 }) };
  }

  if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    return { ok: false, response: NextResponse.json({ message: "Request body is too large" }, { status: 413 }) };
  }

  try {
    const value: unknown = JSON.parse(rawBody);
    if (!isRecord(value)) {
      return { ok: false, response: NextResponse.json({ message: "JSON body must be an object" }, { status: 400 }) };
    }
    return { ok: true, data: value };
  } catch {
    return { ok: false, response: NextResponse.json({ message: "Malformed JSON" }, { status: 400 }) };
  }
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  subject?: string | null,
): Promise<NextResponse | null> {
  const identity = `${getClientAddress(request)}:${subject?.toLowerCase() ?? "anonymous"}`;
  const result = await consumeRateLimit(scope, identity, limit, windowMs);
  if (result.allowed) return null;

  return NextResponse.json(
    { message: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": result.retryAfterSeconds.toString(),
      },
    },
  );
}

export function privateJson(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  return NextResponse.json(data, { ...init, headers });
}
