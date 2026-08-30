import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeProduct } from "@/lib/store";
import { isRecord, nullableInteger, nullableNumber, stringValue } from "@/lib/validation";
import Product from "@/models/Product";
import mongoose from "mongoose";

function validImage(value: unknown) {
  const image = stringValue(value, 2048);
  return image === "" || image.startsWith("/") ? image : "";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  const body: unknown = await request.json();
  if (!isRecord(body)) {
    return NextResponse.json({ message: "Invalid product data" }, { status: 400 });
  }

  const update: Record<string, string | number | boolean | null> = {};
  if ("name" in body) update.name = stringValue(body.name, 160);
  if ("category" in body) update.category = stringValue(body.category, 120);
  if ("description" in body) update.description = stringValue(body.description, 2000);
  if ("image" in body) update.image = validImage(body.image);
  if ("isActive" in body && typeof body.isActive === "boolean") update.isActive = body.isActive;
  if ("stock" in body) {
    const stock = body.stock === null ? null : nullableInteger(body.stock);
    if (stock === null && body.stock !== null) return NextResponse.json({ message: "Invalid stock" }, { status: 400 });
    update.stock = stock;
  }
  if ("price" in body) {
    const price = body.price === null ? null : nullableNumber(body.price);
    if (price === null && body.price !== null) return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    update.price = price;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No product changes supplied" }, { status: 400 });

  await connectDB();
  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  await connectDB();
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json(serializeProduct(product));
}
