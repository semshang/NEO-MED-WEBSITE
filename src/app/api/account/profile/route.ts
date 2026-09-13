import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";
import User from "@/models/User";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase() }).select("name email phone address");
  if (!user) return NextResponse.json({ message: "Account not found" }, { status: 404 });
  return privateJson({ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const rateLimit = await enforceRateLimit(request, "account-profile-update", 20, 15 * 60_000, session.user.email);
  if (rateLimit) return rateLimit;
  const parsed = await readJsonObject(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["name", "phone", "address"])) return NextResponse.json({ message: "Invalid profile" }, { status: 400 });

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
  logSecurityEvent("account_profile_updated", { actor: session.user.email.toLowerCase() });
  return privateJson({ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
}
