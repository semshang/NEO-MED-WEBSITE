import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { serializeOrder } from "@/lib/store";
import { emailValue, isRecord, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys, MAX_ORDER_ITEMS } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Counter from "@/models/Counter";
import mongoose from "mongoose";

interface OrderInputItem {
  productId: string;
  quantity: number;
}

function parseItems(value: unknown): OrderInputItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ORDER_ITEMS) return [];

  const quantities = new Map<string, number>();
  for (const item of value) {
    if (!isRecord(item) || !hasOnlyKeys(item, ["productId", "quantity"])) return [];
    const productId = stringValue(item.productId, 64);
    const quantity = typeof item.quantity === "number" && Number.isInteger(item.quantity) ? item.quantity : 0;
    if (!mongoose.isObjectIdOrHexString(productId) || quantity <= 0 || quantity > 100) return [];
    const combinedQuantity = (quantities.get(productId) ?? 0) + quantity;
    if (combinedQuantity > 100) return [];
    quantities.set(productId, combinedQuantity);
  }

  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

async function generateNextOrderNumber(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let seq = counter.seq;
  let candidate = `ORD-${seq.toString().padStart(4, "0")}`;

  while (await Order.exists({ orderNumber: candidate })) {
    const next = await Counter.findOneAndUpdate(
      { _id: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true }
    );
    seq = next.seq;
    candidate = `ORD-${seq.toString().padStart(4, "0")}`;
  }

  return candidate;
}

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const admin = isAdmin(session);
  const query = admin ? {} : { customerEmail: session.user.email.toLowerCase() };
  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(admin ? 500 : 100);
  return privateJson(orders.map((order) => serializeOrder(order, admin)));
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const session = await getApiSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Please sign in before sending an order request." }, { status: 401 });
  }

  if (isAdmin(session)) return NextResponse.json({ message: "Administrators cannot place customer orders." }, { status: 403 });

  const rateLimit = await enforceRateLimit(request, "order-create", 10, 60 * 60_000, session.user.email);
  if (rateLimit) return rateLimit;

  const parsed = await readJsonObject(request, 32 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["name", "email", "phone", "address", "notes", "items"])) {
    return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
  }

  const customerName = stringValue(body.name, 100);
  const customerPhone = stringValue(body.phone, 24);
  const address = stringValue(body.address, 300);
  const customerNotes = stringValue(body.notes, 2000);
  const email = emailValue(session.user.email);
  const items = parseItems(body.items);

  if (customerName.length < 2 || customerPhone.length < 7 || address.length < 5 || !email || items.length === 0) {
    return NextResponse.json({ message: "Please provide valid contact details and at least one product." }, { status: 400 });
  }

  await connectDB();
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productById = new Map(products.map((product) => [product.id, product]));

  if (productById.size !== productIds.length) {
    return NextResponse.json({ message: "One or more selected products are no longer available." }, { status: 409 });
  }

  const unavailableProduct = items.find((item) => {
    const product = productById.get(item.productId);
    return !product || (product.stock !== null && product.stock < item.quantity);
  });
  if (unavailableProduct) {
    const product = productById.get(unavailableProduct.productId);
    return NextResponse.json({ message: product ? `${product.name} does not have enough confirmed stock.` : "One or more selected products are unavailable." }, { status: 409 });
  }

  const orderItems = items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) throw new Error("Product availability changed while processing this request.");
    return { productId: product.id, name: product.name, quantity: item.quantity, price: product.price };
  });

  const total = orderItems.every((item) => item.price !== null)
    ? orderItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)
    : null;
  const orderNumber = await generateNextOrderNumber();

  const order = await Order.create({
    orderNumber,
    customerId: session.user.id && mongoose.isObjectIdOrHexString(session.user.id) ? session.user.id : undefined,
    customerName,
    customerEmail: email,
    customerPhone,
    address,
    customerNotes,
    total,
    items: orderItems,
  });

  logSecurityEvent("order_created", { actor: email, orderId: order.orderNumber });
  return privateJson(serializeOrder(order, false), { status: 201 });
}
