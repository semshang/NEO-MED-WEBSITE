import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { ORDER_STATUSES } from "@/lib/store-types";
import { serializeOrder } from "@/lib/store";
import { isRecord, stringValue } from "@/lib/validation";
import Order from "@/models/Order";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) return NextResponse.json({ message: "Invalid order data" }, { status: 400 });

  const update: { status?: (typeof ORDER_STATUSES)[number]; adminNotes?: string } = {};
  if (typeof body.status === "string" && ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
    update.status = body.status as (typeof ORDER_STATUSES)[number];
  }
  if ("adminNotes" in body) update.adminNotes = stringValue(body.adminNotes, 4000);
  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No valid updates supplied" }, { status: 400 });

  const { id } = await context.params;
  await connectDB();
  const order = await Order.findOneAndUpdate({ orderNumber: id }, update, { new: true, runValidators: true });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  return NextResponse.json(serializeOrder(order));
}
