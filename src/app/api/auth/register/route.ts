import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS } from "@/config/admins";
import { emailValue, isRecord, stringValue } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!isRecord(body)) return NextResponse.json({ message: "Invalid registration data" }, { status: 400 });
    const name = stringValue(body.name, 100);
    const email = emailValue(body.email);
    const password = typeof body.password === "string" ? body.password : "";

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
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
