import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { emailValue, isRecord, stringValue } from "@/lib/validation";
import CustomerMeta from "@/models/CustomerMeta";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  const entries = await CustomerMeta.find();
  return NextResponse.json(entries.map((entry) => ({ email: entry.email, vip: entry.vip, notes: entry.notes })));
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json();
  if (!isRecord(body)) return NextResponse.json({ message: "Invalid customer data" }, { status: 400 });

  const email = emailValue(body.email);
  if (!email) return NextResponse.json({ message: "Invalid customer email" }, { status: 400 });

  const update: { vip?: boolean; notes?: string } = {};
  if (typeof body.vip === "boolean") update.vip = body.vip;
  if ("notes" in body) update.notes = stringValue(body.notes, 2000);
  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No customer changes supplied" }, { status: 400 });

  await connectDB();
  const customer = await CustomerMeta.findOneAndUpdate({ email }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
  return NextResponse.json({ email: customer.email, vip: customer.vip, notes: customer.notes });
}
