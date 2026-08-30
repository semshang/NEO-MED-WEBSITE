import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS } from "@/config/admins";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "customer";

    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}