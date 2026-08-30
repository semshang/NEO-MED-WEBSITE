import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { isRecord, stringValue } from "@/lib/validation";
import User from "@/models/User";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase() });
  if (!user) return NextResponse.json({ message: "Account not found" }, { status: 404 });
  return NextResponse.json({ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
}

export async function PATCH(request: Request) {
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json();
  if (!isRecord(body)) return NextResponse.json({ message: "Invalid profile" }, { status: 400 });

  const name = stringValue(body.name, 100);
  const phone = stringValue(body.phone, 24);
  const address = stringValue(body.address, 300);
  if (name.length < 2) return NextResponse.json({ message: "Please provide your name." }, { status: 400 });

  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: session.user.email.toLowerCase() },
    { name, phone, address },
    { new: true, runValidators: true }
  );
  if (!user) return NextResponse.json({ message: "Account not found" }, { status: 404 });
  return NextResponse.json({ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
}
