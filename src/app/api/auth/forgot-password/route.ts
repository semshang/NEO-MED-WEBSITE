import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";
import { SITE } from "@/config/site";
import { emailValue } from "@/lib/validation";
import { enforceRateLimit, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { escapeHtml, hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";

const GENERIC_RESPONSE = { message: "If an account exists, a reset link has been sent." };

export async function POST(req: Request) {
  try {
    const originError = requireSameOrigin(req);
    if (originError) return originError;
    const parsed = await readJsonObject(req, 8 * 1024);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!hasOnlyKeys(body, ["email"])) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    const email = emailValue(body.email);

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const ipLimit = await enforceRateLimit(req, "forgot-password-ip", 5, 15 * 60_000);
    if (ipLimit) return ipLimit;
    const emailLimit = await enforceRateLimit(req, "forgot-password-email", 3, 15 * 60_000, email);
    if (emailLimit) return emailLimit;

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    const siteUrl = process.env.NEXTAUTH_URL;
    if (!resendApiKey || !resendFromEmail || !siteUrl) {
      logSecurityEvent("password_reset_configuration_incomplete");
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }

    const baseUrl = new URL(siteUrl);
    if (
      baseUrl.username ||
      baseUrl.password ||
      (process.env.NODE_ENV === "production" && (baseUrl.protocol !== "https:" || baseUrl.hostname === "localhost"))
    ) {
      logSecurityEvent("password_reset_production_url_invalid");
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }
    const resend = new Resend(resendApiKey);

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success even if user not found for security reasons
    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await user.save();

    const resetUrl = new URL("/reset-password", baseUrl);
    resetUrl.searchParams.set("token", resetToken);
    resetUrl.searchParams.set("email", user.email);

    const { error } = await resend.emails.send({
      from: `Neomeditech Support <${resendFromEmail}>`,
      to: user.email,
      subject: `Password Reset Request - ${SITE.name}`,
      html: `
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl.toString()}">Reset Password</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
    if (error) {
      logServerError("password_reset_delivery", error);
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }

    logSecurityEvent("password_reset_requested", { email: user.email });
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (error: unknown) {
    logServerError("forgot_password", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
