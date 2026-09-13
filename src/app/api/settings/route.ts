import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { getStoreSettings, serializeSettings } from "@/lib/store";
import { emailValue, nullableInteger, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  await connectDB();
  return privateJson(serializeSettings(await getStoreSettings()));
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-settings-update", 20, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;
  const parsed = await readJsonObject(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["phone", "email", "whatsapp", "address", "notificationEmail", "lowStockThreshold"])) {
    return NextResponse.json({ message: "Invalid settings" }, { status: 400 });
  }

  const phone = stringValue(body.phone, 100);
  const whatsapp = stringValue(body.whatsapp, 30);
  const address = stringValue(body.address, 300);
  const email = emailValue(body.email);
  const notificationEmail = emailValue(body.notificationEmail);
  const lowStockThreshold = nullableInteger(body.lowStockThreshold, 100_000);

  if (!phone || !whatsapp || !address || !email || !notificationEmail || lowStockThreshold === null) {
    return NextResponse.json({ message: "Please provide complete, valid settings." }, { status: 400 });
  }

  await connectDB();
  const settings = await getStoreSettings();
  settings.phone = phone;
  settings.whatsapp = whatsapp;
  settings.address = address;
  settings.email = email;
  settings.notificationEmail = notificationEmail;
  settings.lowStockThreshold = lowStockThreshold;
  await settings.save();
  logSecurityEvent("admin_settings_updated", { actor: auth.session.user.email });
  return privateJson(serializeSettings(settings));
}
