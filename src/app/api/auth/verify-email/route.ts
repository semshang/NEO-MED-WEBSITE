import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { enforceRateLimit } from "@/lib/request-security";
import { emailValue } from "@/lib/validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";
import { getVerificationRedirectOrigin } from "@/lib/auth-origin";
import User from "@/models/User";

function redirectToLogin(request: Request, result: "verified" | "invalid") {
  const baseUrl = getVerificationRedirectOrigin(request);
  if (!baseUrl) {
    const response = NextResponse.json({ message: "Email verification is temporarily unavailable." }, { status: 503 });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  const target = new URL("/", baseUrl);
  target.searchParams.set("login", "true");
  target.searchParams.set("verification", result);
  const response = NextResponse.redirect(target, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: Request) {
  try {
    const rateLimit = await enforceRateLimit(request, "email-verification", 10, 15 * 60_000);
    if (rateLimit) return rateLimit;

    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? "";
    const email = emailValue(url.searchParams.get("email"));
    if (!/^[a-f0-9]{64}$/i.test(token) || !email) return redirectToLogin(request, "invalid");

    const verificationToken = crypto.createHash("sha256").update(token).digest("hex");
    await connectDB();
    const user = await User.findOneAndUpdate(
      {
        email,
        verificationToken,
        verificationTokenExpiry: { $gt: new Date() },
      },
      {
        $set: { emailVerifiedAt: new Date() },
        $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
        $inc: { authVersion: 1 },
      },
      { new: true, runValidators: true },
    );

    if (!user) return redirectToLogin(request, "invalid");
    logSecurityEvent("email_verified", { email: user.email });
    return redirectToLogin(request, "verified");
  } catch (error: unknown) {
    logServerError("email_verification", error);
    return redirectToLogin(request, "invalid");
  }
}
