import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureCatalogSeeded, getSeedCatalogProducts, shouldServeLocalSeedCatalog } from "@/lib/catalog";
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
import { slugifyCategory } from "@/lib/product-slugs";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function GET() {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }
    const products = await Product.find({
      isActive: { $ne: false },
      active: { $ne: false },
    })
      .sort({ category: 1, name: 1 })
      .limit(250);
    return NextResponse.json(products.map(serializeProduct));
  } catch (error) {
    logServerError("products_get", error);
    if (process.env.NODE_ENV !== "production" && shouldServeLocalSeedCatalog(error)) {
      return NextResponse.json(getSeedCatalogProducts());
    }
    return NextResponse.json({ message: "Unable to load products." }, { status: 500 });
  }
}

const ALLOWED_PRODUCT_KEYS = [
  "name",
  "category",
  "stock",
  "price",
  "description",
  "image",
  "isActive",
  "active",
  "seoTitle",
  "seoDescription",
  "shortDescription",
  "detailedDescription",
  "brand",
  "model",
  "features",
  "applications",
  "specifications",
  "warranty",
  "installationSupport",
  "deliveryInformation",
  "faq",
  "imageAlt",
] as const;

function parseStringList(value: unknown, maxItems = 25, maxItemLen = 300): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxItemLen));
}

function parseSpecifications(value: unknown, maxItems = 30): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  const result: { label: string; value: string }[] = [];
  for (const item of value) {
    if (result.length >= maxItems) break;
    if (typeof item === "object" && item !== null && "label" in item && "value" in item) {
      const label = String(item.label).trim().slice(0, 200);
      const val = String(item.value).trim().slice(0, 500);
      if (label && val) {
        result.push({ label, value: val });
      }
    }
  }
  return result;
}

function parseFaq(value: unknown, maxItems = 20): { question: string; answer: string }[] {
  if (!Array.isArray(value)) return [];
  const result: { question: string; answer: string }[] = [];
  for (const item of value) {
    if (result.length >= maxItems) break;
    if (typeof item === "object" && item !== null && "question" in item && "answer" in item) {
      const question = String(item.question).trim().slice(0, 500);
      const answer = String(item.answer).trim().slice(0, 2000);
      if (question && answer) {
        result.push({ question, answer });
      }
    }
  }
  return result;
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
  if (!hasOnlyKeys(body, ALLOWED_PRODUCT_KEYS)) {
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
      isActive: body.isActive !== false && (body as { active?: unknown }).active !== false,
      active: body.isActive !== false && (body as { active?: unknown }).active !== false,
      seoTitle: stringValue(body.seoTitle, 160),
      seoDescription: stringValue(body.seoDescription, 500),
      shortDescription: stringValue(body.shortDescription, 500),
      detailedDescription: stringValue(body.detailedDescription, 5000),
      brand: stringValue(body.brand, 120),
      model: stringValue(body.model, 120),
      features: parseStringList(body.features),
      applications: parseStringList(body.applications),
      specifications: parseSpecifications(body.specifications),
      warranty: stringValue(body.warranty, 500),
      installationSupport: stringValue(body.installationSupport, 500),
      deliveryInformation: stringValue(body.deliveryInformation, 500),
      faq: parseFaq(body.faq),
      imageAlt: stringValue(body.imageAlt, 200),
    });

    logSecurityEvent("admin_product_created", { actor: auth.session.user.email, productId: product.id });

    try {
      revalidatePath(`/products/${product.slug}`);
      if (product.category) {
        revalidatePath(`/products/category/${slugifyCategory(product.category)}`);
      }
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
