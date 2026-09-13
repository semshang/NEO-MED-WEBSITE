import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { emailValue } from "@/lib/validation";
import { clearRateLimit } from "@/lib/rate-limit";
import { enforceRateLimit, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys, isAcceptablePassword } from "@/lib/security-validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";

export async function POST(req: Request) {
  try {
    const originError = requireSameOrigin(req);
    if (originError) return originError;
    const parsed = await readJsonObject(req, 16 * 1024);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!hasOnlyKeys(body, ["token", "email", "newPassword"])) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    const token = typeof body.token === "string" ? body.token : "";
    const email = emailValue(body.email);
    const newPassword = body.newPassword;

    if (!/^[a-f0-9]{64}$/i.test(token) || !email || !isAcceptablePassword(newPassword)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const ipLimit = await enforceRateLimit(req, "reset-password-ip", 8, 15 * 60_000);
    if (ipLimit) return ipLimit;
    const emailLimit = await enforceRateLimit(req, "reset-password-email", 5, 15 * 60_000, email);
    if (emailLimit) return emailLimit;

    await connectDB();

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: new Date() } // Ensure token hasn't expired
    }).select("+authVersion");

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.emailVerifiedAt = new Date();
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.authVersion = (user.authVersion ?? 0) + 1;
    await user.save();

    await clearRateLimit("credentials-login", email);
    logSecurityEvent("password_reset_completed", { email: user.email });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    logServerError("reset_password", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
