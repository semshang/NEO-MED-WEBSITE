import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { serializeMessage } from "@/lib/store";
import { requireSameOrigin, readJsonObject, privateJson } from "@/lib/request-security";
import ContactMessage from "@/models/ContactMessage";
import mongoose from "mongoose";
import { hasOnlyKeys } from "@/lib/security-validation";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const session = await getApiSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJsonObject(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;

  const body = parsed.data;
  if (!hasOnlyKeys(body, ["unread"])) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (!mongoose.isObjectIdOrHexString(params.id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  await connectDB();
  const msg = await ContactMessage.findById(params.id);
  if (!msg) {
    return NextResponse.json({ message: "Message not found" }, { status: 404 });
  }

  if (typeof body.unread === "boolean") {
    msg.unread = body.unread;
  }
  
  await msg.save();
  return privateJson(serializeMessage(msg));
}
