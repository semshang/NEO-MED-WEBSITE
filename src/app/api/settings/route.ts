import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { getStoreSettings, serializeSettings } from "@/lib/store";
import { emailValue, isRecord, nullableInteger, stringValue } from "@/lib/validation";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  return NextResponse.json(serializeSettings(await getStoreSettings()));
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json();
  if (!isRecord(body)) return NextResponse.json({ message: "Invalid settings" }, { status: 400 });

  const phone = stringValue(body.phone, 100);
  const whatsapp = stringValue(body.whatsapp, 30);
  const address = stringValue(body.address, 300);
  const email = emailValue(body.email);
  const notificationEmail = emailValue(body.notificationEmail);
  const lowStockThreshold = nullableInteger(body.lowStockThreshold);

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
  return NextResponse.json(serializeSettings(settings));
}
