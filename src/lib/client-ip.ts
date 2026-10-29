import { isIP } from "node:net";

const MAX_CLIENT_ADDRESS_LENGTH = 128;

export function getClientAddress(request: Request): string {
  if (process.env.VERCEL !== "1") return "unknown";

  const forwarded = request.headers.get("x-forwarded-for")?.trim();
  if (
    !forwarded ||
    forwarded.includes(",") ||
    forwarded.length > MAX_CLIENT_ADDRESS_LENGTH ||
    isIP(forwarded) === 0
  ) {
    return "unknown";
  }

  return forwarded;
}
