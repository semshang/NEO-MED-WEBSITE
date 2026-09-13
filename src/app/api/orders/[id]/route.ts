import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { ORDER_STATUSES } from "@/lib/store-types";
import { serializeOrder } from "@/lib/store";
import { stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys, validOrderNumber } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";
import Order from "@/models/Order";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-order-update", 60, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;

  const parsed = await readJsonObject(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["status", "adminNotes"])) return NextResponse.json({ message: "Invalid order data" }, { status: 400 });

  const update: { status?: (typeof ORDER_STATUSES)[number]; adminNotes?: string } = {};
  if (typeof body.status === "string" && ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
    update.status = body.status as (typeof ORDER_STATUSES)[number];
  }
  if ("adminNotes" in body) update.adminNotes = stringValue(body.adminNotes, 4000);
  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No valid updates supplied" }, { status: 400 });

  const id = validOrderNumber((await context.params).id);
  if (!id) return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  await connectDB();
  const order = await Order.findOneAndUpdate({ orderNumber: id }, update, { new: true, runValidators: true });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  logSecurityEvent("admin_order_updated", { actor: auth.session.user.email, orderId: id, status: update.status });
  return privateJson(serializeOrder(order, true));
}
