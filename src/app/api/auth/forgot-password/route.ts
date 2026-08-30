import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";
import { SITE } from "@/config/site";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    const siteUrl = process.env.NEXTAUTH_URL;
    if (!resendApiKey || !resendFromEmail || !siteUrl) {
      console.error("Password-reset email configuration is incomplete.");
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }

    const baseUrl = new URL(siteUrl);
    if (process.env.NODE_ENV === "production" && baseUrl.hostname === "localhost") {
      console.error("NEXTAUTH_URL must use the production domain before password resets can be sent.");
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }
    const resend = new Resend(resendApiKey);

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success even if user not found for security reasons
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await user.save();

    const resetUrl = new URL(`${baseUrl.pathname.replace(/\/$/, "")}/reset-password`, baseUrl);
    resetUrl.searchParams.set("token", resetToken);
    resetUrl.searchParams.set("email", user.email);

    const { error } = await resend.emails.send({
      from: `Neomeditech Support <${resendFromEmail}>`,
      to: user.email,
      subject: `Password Reset Request - ${SITE.name}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl.toString()}">Reset Password</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
    if (error) {
      console.error("Password-reset email could not be delivered.", error);
      return NextResponse.json({ message: "Password reset is temporarily unavailable." }, { status: 503 });
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
