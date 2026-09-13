import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { emailValue, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";
import CustomerMeta from "@/models/CustomerMeta";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  await connectDB();
  const entries = await CustomerMeta.find().sort({ updatedAt: -1 }).limit(1_000);
  return privateJson(entries.map((entry) => ({ email: entry.email, vip: entry.vip, notes: entry.notes })));
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-customer-update", 60, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;
  const parsed = await readJsonObject(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["email", "vip", "notes"])) return NextResponse.json({ message: "Invalid customer data" }, { status: 400 });

  const email = emailValue(body.email);
  if (!email) return NextResponse.json({ message: "Invalid customer email" }, { status: 400 });

  const update: { vip?: boolean; notes?: string } = {};
  if (typeof body.vip === "boolean") update.vip = body.vip;
  if ("notes" in body) update.notes = stringValue(body.notes, 2000);
  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No customer changes supplied" }, { status: 400 });

  await connectDB();
  const customer = await CustomerMeta.findOneAndUpdate({ email }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
  logSecurityEvent("admin_customer_metadata_updated", { actor: auth.session.user.email, customer: email });
  return privateJson({ email: customer.email, vip: customer.vip, notes: customer.notes });
}
