import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureCatalogSeeded } from "@/lib/catalog";
import { requireAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeProduct } from "@/lib/store";
import { nullableInteger, nullableNumber, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";
import { processProductImage, cleanupBlob } from "@/lib/product-blob";
import { CATEGORIES } from "@/data/products";
import Product from "@/models/Product";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function GET() {
  await connectDB();
  await ensureCatalogSeeded();
  const products = await Product.find({ isActive: true }).sort({ category: 1, name: 1 }).limit(250);
  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-product-create", 30, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;

  const parsed = await readJsonObject(request, 8 * 1024 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ["name", "category", "stock", "price", "description", "image", "isActive"])) {
    return NextResponse.json({ message: "Invalid product data" }, { status: 400 });
  }

  const name = stringValue(body.name, 160);
  const category = stringValue(body.category, 120);
  const stock = body.stock === null ? null : nullableInteger(body.stock, 1_000_000);
  const price = body.price === null ? null : nullableNumber(body.price, 1_000_000_000);

  if (!name || !category || !CATEGORIES.includes(category) || (body.stock !== null && stock === null) || (body.price !== null && price === null)) {
    return NextResponse.json({ message: "Provide a name, category, and valid inventory values" }, { status: 400 });
  }

  let image = "";
  let createdBlobUrl: string | undefined;
  if (body.image !== undefined && body.image !== null && body.image !== "") {
    const imageResult = await processProductImage(body.image);
    if (!imageResult.ok) {
      return NextResponse.json({ message: imageResult.message }, { status: imageResult.status });
    }
    image = imageResult.image;
    createdBlobUrl = imageResult.createdBlobUrl;
  }

  await connectDB();
  const baseSlug = slugify(name);
  if (!baseSlug) {
    await cleanupBlob(createdBlobUrl);
    return NextResponse.json({ message: "Product name must contain letters or numbers." }, { status: 400 });
  }

  const existing = await Product.countDocuments({ slug: new RegExp(`^${baseSlug}(?:-\\d+)?$`) });
  try {
    const product = await Product.create({
      name,
      slug: existing ? `${baseSlug}-${existing + 1}` : baseSlug,
      category,
      image,
      stock,
      price,
      description: stringValue(body.description, 2000),
      isActive: body.isActive !== false,
    });

    logSecurityEvent("admin_product_created", { actor: auth.session.user.email, productId: product.id });

    try {
      revalidatePath(`/products/${product.slug}`);
      revalidatePath("/shop");
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation error after product create:", e);
    }

    return privateJson(serializeProduct(product), { status: 201 });
  } catch (error) {
    await cleanupBlob(createdBlobUrl);
    logServerError("admin_product_create_save", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
