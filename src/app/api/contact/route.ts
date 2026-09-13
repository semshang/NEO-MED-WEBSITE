import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { serializeMessage } from "@/lib/store";
import { emailValue, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { escapeHtml, hasOnlyKeys } from "@/lib/security-validation";
import { logServerError } from "@/lib/security-log";
import ContactMessage from "@/models/ContactMessage";
import mongoose from "mongoose";
import { Resend } from "resend";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const admin = isAdmin(session);
  const query = admin ? {} : { email: session.user.email.toLowerCase() };
  const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).limit(admin ? 500 : 100);
  return privateJson(messages.map(serializeMessage));
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const rateLimit = await enforceRateLimit(request, "contact-create", 5, 10 * 60_000);
  if (rateLimit) return rateLimit;
  const parsed = await readJsonObject(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["name", "email", "subject", "message"])) {
    return NextResponse.json({ message: "Invalid message data" }, { status: 400 });
  }

  const session = await getApiSession();
  const senderName = stringValue(body.name, 100);
  const sessionEmail = emailValue(session?.user?.email);
  const email = sessionEmail || emailValue(body.email);
  const subject = stringValue(body.subject, 180);
  const message = stringValue(body.message, 5000);

  if (senderName.length < 2 || !email || subject.length < 3 || message.length < 10) {
    return NextResponse.json({ message: "Please complete all message fields." }, { status: 400 });
  }

  await connectDB();
  const contact = await ContactMessage.create({
    customerId: session?.user?.id && mongoose.isObjectIdOrHexString(session.user.id) ? session.user.id : undefined,
    senderName,
    email,
    subject,
    body: message,
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  if (!resendApiKey || !resendFromEmail) {
    logServerError("contact_email_delivery", new Error("Resend credentials not configured"));
    return NextResponse.json({ message: "Email delivery service is currently unavailable. Please try again later." }, { status: 500 });
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: `Neomeditech Support <${resendFromEmail}>`,
      to: "contact.neomeditech@gmail.com",
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
            <tr>
              <td align="center" style="padding: 20px 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  <!-- Header -->
                  <tr>
                    <td bgcolor="#1B6EC2" style="background: #1B6EC2; background: linear-gradient(135deg, #1B6EC2 0%, #4CAF50 100%); padding: 28px 30px; text-align: left;">
                      <img src="https://neomeditech.com.np/logo-transparent.png" alt="Neomeditech Biomedical Solutions" width="60" height="60" style="display: block; width: 60px; height: auto; margin-bottom: 14px; border: 0;" />
                      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; opacity: 0.95;">NEOMEDITECH BIOMEDICAL SOLUTIONS</p>
                      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">New Contact Form Message</h1>
                    </td>
                  </tr>
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding-bottom: 16px;">
                            <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1A2B3C; margin-bottom: 4px;">Name</span>
                            <span style="font-size: 15px; color: #1A2B3C; font-weight: 500;">${escapeHtml(senderName)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 16px;">
                            <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1A2B3C; margin-bottom: 4px;">Email</span>
                            <a href="mailto:${escapeHtml(email)}" style="font-size: 15px; color: #1B6EC2; text-decoration: none; font-weight: 500;">${escapeHtml(email)}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1A2B3C; margin-bottom: 4px;">Subject</span>
                            <span style="font-size: 15px; color: #1A2B3C; font-weight: 500;">${escapeHtml(subject)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 10px;">
                            <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1A2B3C; margin-bottom: 6px;">Message</span>
                            <div style="background-color: #f0f7fd; border: 1px solid #d1e3f3; border-radius: 6px; padding: 16px 18px; font-size: 14px; line-height: 1.6; color: #1A2B3C; white-space: pre-wrap;">${escapeHtml(message)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 30px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                        This message was sent via the contact form on <a href="https://neomeditech.com.np" style="color: #1B6EC2; text-decoration: none; font-weight: 600;">neomeditech.com.np</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    if (error) {
      logServerError("contact_email_delivery", error);
      return NextResponse.json({ message: "Failed to send message. Please try again later." }, { status: 500 });
    }
  } catch (error) {
    logServerError("contact_email_delivery", error);
    return NextResponse.json({ message: "Failed to send message. Please try again later." }, { status: 500 });
  }

  return privateJson(serializeMessage(contact), { status: 201 });
}
