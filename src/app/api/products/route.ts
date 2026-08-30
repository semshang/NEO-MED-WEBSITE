import { NextResponse } from "next/server";
import { ensureCatalogSeeded } from "@/lib/catalog";
import { getAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeProduct } from "@/lib/store";
import { isRecord, nullableInteger, nullableNumber, stringValue } from "@/lib/validation";
import Product from "@/models/Product";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function validImage(value: unknown) {
  const image = stringValue(value, 2048);
  return image === "" || image.startsWith("/") ? image : "";
}

export async function GET() {
  await connectDB();
  await ensureCatalogSeeded();
  const products = await Product.find({ isActive: true }).sort({ category: 1, name: 1 });
  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) {
    return NextResponse.json({ message: "Invalid product data" }, { status: 400 });
  }

  const name = stringValue(body.name, 160);
  const category = stringValue(body.category, 120);
  const stock = body.stock === null ? null : nullableInteger(body.stock);
  const price = body.price === null ? null : nullableNumber(body.price);

  if (!name || !category || (body.stock !== null && stock === null) || (body.price !== null && price === null)) {
    return NextResponse.json({ message: "Provide a name, category, and valid inventory values" }, { status: 400 });
  }

  await connectDB();
  const baseSlug = slugify(name);
  if (!baseSlug) return NextResponse.json({ message: "Product name must contain letters or numbers." }, { status: 400 });
  const existing = await Product.countDocuments({ slug: new RegExp(`^${baseSlug}(?:-\\d+)?$`) });
  const product = await Product.create({
    name,
    slug: existing ? `${baseSlug}-${existing + 1}` : baseSlug,
    category,
    image: validImage(body.image),
    stock,
    price,
    description: stringValue(body.description, 2000),
    isActive: body.isActive !== false,
  });

  return NextResponse.json(serializeProduct(product), { status: 201 });
}
