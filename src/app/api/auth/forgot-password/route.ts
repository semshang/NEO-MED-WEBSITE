import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";
import { SITE } from "@/config/site";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

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

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: `Support <onboarding@resend.dev>`, // Default test sender for free tier
        to: user.email,
        subject: `Password Reset Request - ${SITE.name}`,
        html: `
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link is valid for 1 hour.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `
      });
    } else {
      console.warn("No RESEND_API_KEY found, printing reset URL to console instead:");
      console.log(resetUrl);
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}