code = """
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, email, newPassword } = await req.json();

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
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
"""

with open("src/app/api/auth/reset-password/route.ts", "w", encoding="utf-8") as f:
    f.write(code.strip())
