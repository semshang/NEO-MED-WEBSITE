import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { emailValue, isRecord } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!isRecord(body)) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    const token = typeof body.token === "string" ? body.token : "";
    const email = emailValue(body.email);
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!token || !email || !newPassword) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: new Date() } // Ensure token hasn't expired
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
