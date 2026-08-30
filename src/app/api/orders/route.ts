import { NextResponse } from "next/server";
import { getApiSession, getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeOrder } from "@/lib/store";
import { emailValue, isRecord, stringValue } from "@/lib/validation";
import Order from "@/models/Order";
import Product from "@/models/Product";

interface OrderInputItem {
  productId: string;
  quantity: number;
}

function parseItems(value: unknown): OrderInputItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const productId = stringValue(item.productId, 64);
    const quantity = typeof item.quantity === "number" && Number.isInteger(item.quantity) ? item.quantity : 0;
    return productId && quantity > 0 && quantity <= 100 ? [{ productId, quantity }] : [];
  });
}

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const query = (await getAdminSession()) ? {} : { customerEmail: session.user.email.toLowerCase() };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Please sign in before sending an order request." }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) {
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
  const orderNumber = `ORD-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

  const order = await Order.create({
    orderNumber,
    customerId: session.user.id || undefined,
    customerName,
    customerEmail: email,
    customerPhone,
    address,
    customerNotes,
    total,
    items: orderItems,
  });

  return NextResponse.json(serializeOrder(order), { status: 201 });
}
