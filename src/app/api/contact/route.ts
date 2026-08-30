import { NextResponse } from "next/server";
import { getApiSession, getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeMessage } from "@/lib/store";
import { emailValue, isRecord, stringValue } from "@/lib/validation";
import ContactMessage from "@/models/ContactMessage";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const query = (await getAdminSession()) ? {} : { email: session.user.email.toLowerCase() };
  const messages = await ContactMessage.find(query).sort({ createdAt: -1 });
  return NextResponse.json(messages.map(serializeMessage));
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (!isRecord(body)) return NextResponse.json({ message: "Invalid message data" }, { status: 400 });

  const session = await getApiSession();
  const senderName = stringValue(body.name, 100);
  const email = emailValue(body.email) || emailValue(session?.user?.email);
  const subject = stringValue(body.subject, 180);
  const message = stringValue(body.message, 5000);

  if (senderName.length < 2 || !email || subject.length < 3 || message.length < 10) {
    return NextResponse.json({ message: "Please complete all message fields." }, { status: 400 });
  }

  await connectDB();
  const contact = await ContactMessage.create({
    customerId: session?.user?.id,
    senderName,
    email,
    subject,
    body: message,
  });
  return NextResponse.json(serializeMessage(contact), { status: 201 });
}
