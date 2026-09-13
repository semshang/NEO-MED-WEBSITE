import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { isAdminEmail } from "@/config/admins";
import { SITE } from "@/config/site";
import { emailValue, stringValue } from "@/lib/validation";
import { enforceRateLimit, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { escapeHtml, hasOnlyKeys, isAcceptablePassword } from "@/lib/security-validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";

const GENERIC_RESPONSE = { message: "If these details can be registered, a verification link has been sent." };

export async function POST(req: Request) {
  try {
    const originError = requireSameOrigin(req);
    if (originError) return originError;
    const parsed = await readJsonObject(req, 16 * 1024);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!hasOnlyKeys(body, ["name", "email", "password"])) {
      return NextResponse.json({ message: "Invalid registration data" }, { status: 400 });
    }
    const name = stringValue(body.name, 100);
    const email = emailValue(body.email);
    const password = body.password;

    if (!name || !email || !isAcceptablePassword(password)) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const ipLimit = await enforceRateLimit(req, "registration-ip", 5, 60 * 60_000);
    if (ipLimit) return ipLimit;
    const emailLimit = await enforceRateLimit(req, "registration-email", 3, 60 * 60_000, email);
    if (emailLimit) return emailLimit;

    if (isAdminEmail(email)) {
      logSecurityEvent("admin_password_registration_denied", { email });
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    const siteUrl = process.env.NEXTAUTH_URL;
    if (!resendApiKey || !resendFromEmail || !siteUrl) {
      logSecurityEvent("registration_verification_configuration_incomplete");
      return NextResponse.json({ message: "Registration is temporarily unavailable." }, { status: 503 });
    }

    let baseUrl: URL;
    try {
      baseUrl = new URL(siteUrl);
      if (baseUrl.username || baseUrl.password || (process.env.NODE_ENV === "production" && (baseUrl.protocol !== "https:" || baseUrl.hostname === "localhost"))) {
        throw new Error("Invalid production site URL");
      }
    } catch {
      logSecurityEvent("registration_verification_url_invalid");
      return NextResponse.json({ message: "Registration is temporarily unavailable." }, { status: 503 });
    }

    await connectDB();
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "customer",
      verificationToken: verificationTokenHash,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verificationUrl = new URL("/api/auth/verify-email", baseUrl);
    verificationUrl.searchParams.set("token", verificationToken);
    verificationUrl.searchParams.set("email", user.email);

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: `Neomeditech Support <${resendFromEmail}>`,
      to: user.email,
      subject: `Verify your email - ${SITE.name}`,
      html: `
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>Confirm that this email address belongs to you before signing in:</p>
        <p><a href="${verificationUrl.toString()}">Verify email address</a></p>
        <p>This link is valid for 24 hours.</p>
        <p>If you did not create this account, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      await User.deleteOne({ _id: user._id, emailVerifiedAt: { $exists: false } });
      logServerError("registration_verification_delivery", error);
      return NextResponse.json({ message: "Registration is temporarily unavailable." }, { status: 503 });
    }

    logSecurityEvent("registration_verification_sent", { email: user.email });
    return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }
    logServerError("registration", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
