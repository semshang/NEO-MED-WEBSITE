import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/api-auth";
import connectDB from "@/lib/mongoose";
import { serializeProduct } from "@/lib/store";
import { nullableInteger, nullableNumber, stringValue } from "@/lib/validation";
import { enforceRateLimit, privateJson, readJsonObject, requireSameOrigin } from "@/lib/request-security";
import { hasOnlyKeys } from "@/lib/security-validation";
import { logSecurityEvent, logServerError } from "@/lib/security-log";
import { processProductImage, cleanupBlob } from "@/lib/product-blob";
import { CATEGORIES } from "@/data/products";
import Product, { type IProduct } from "@/models/Product";
import mongoose from "mongoose";
import { slugifyCategory } from "@/lib/product-slugs";

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-product-update", 60, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;

  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  const parsed = await readJsonObject(request, 8 * 1024 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!hasOnlyKeys(body, ALLOWED_PRODUCT_KEYS)) {
    return NextResponse.json({ message: "Invalid product data" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if ("name" in body) {
    const name = stringValue(body.name, 160);
    if (!name) return NextResponse.json({ message: "Invalid product name" }, { status: 400 });
    update.name = name;
  }
  if ("category" in body) {
    const category = stringValue(body.category, 120);
    if (!category || !CATEGORIES.includes(category)) return NextResponse.json({ message: "Invalid product category" }, { status: 400 });
    update.category = category;
  }
  if ("description" in body) {
    if (typeof body.description !== "string" || body.description.trim().length > 2000) return NextResponse.json({ message: "Invalid product description" }, { status: 400 });
    update.description = stringValue(body.description, 2000);
  }
  let createdBlobUrl: string | undefined;
  if ("image" in body) {
    const imageResult = await processProductImage(body.image);
    if (!imageResult.ok) {
      return NextResponse.json({ message: imageResult.message }, { status: imageResult.status });
    }
    update.image = imageResult.image;
    createdBlobUrl = imageResult.createdBlobUrl;
  }
  if ("isActive" in body && typeof body.isActive === "boolean") {
    update.isActive = body.isActive;
    update.active = body.isActive;
  } else if ("active" in body && typeof (body as { active?: unknown }).active === "boolean") {
    update.isActive = (body as { active: boolean }).active;
    update.active = (body as { active: boolean }).active;
  }
  if ("stock" in body) {
    const stock = body.stock === null ? null : nullableInteger(body.stock, 1_000_000);
    if (stock === null && body.stock !== null) return NextResponse.json({ message: "Invalid stock" }, { status: 400 });
    update.stock = stock;
  }
  if ("price" in body) {
    const price = body.price === null ? null : nullableNumber(body.price, 1_000_000_000);
    if (price === null && body.price !== null) return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    update.price = price;
  }
  if ("seoTitle" in body) update.seoTitle = stringValue(body.seoTitle, 160);
  if ("seoDescription" in body) update.seoDescription = stringValue(body.seoDescription, 500);
  if ("shortDescription" in body) update.shortDescription = stringValue(body.shortDescription, 500);
  if ("detailedDescription" in body) update.detailedDescription = stringValue(body.detailedDescription, 5000);
  if ("brand" in body) update.brand = stringValue(body.brand, 120);
  if ("model" in body) update.model = stringValue(body.model, 120);
  if ("features" in body) update.features = parseStringList(body.features);
  if ("applications" in body) update.applications = parseStringList(body.applications);
  if ("specifications" in body) update.specifications = parseSpecifications(body.specifications);
  if ("warranty" in body) update.warranty = stringValue(body.warranty, 500);
  if ("installationSupport" in body) update.installationSupport = stringValue(body.installationSupport, 500);
  if ("deliveryInformation" in body) update.deliveryInformation = stringValue(body.deliveryInformation, 500);
  if ("faq" in body) update.faq = parseFaq(body.faq);
  if ("imageAlt" in body) update.imageAlt = stringValue(body.imageAlt, 200);

  if (Object.keys(update).length === 0) return NextResponse.json({ message: "No product changes supplied" }, { status: 400 });

  await connectDB();
  try {
    const existingProduct = await Product.findById(id).lean<IProduct>();
    if (!existingProduct) {
      await cleanupBlob(createdBlobUrl);
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!product) {
      await cleanupBlob(createdBlobUrl);
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    logSecurityEvent("admin_product_updated", { actor: auth.session.user.email, productId: id });

    try {
      if (product.slug) {
        revalidatePath(`/products/${product.slug}`);
      }
      if (product.category) {
        revalidatePath(`/products/category/${slugifyCategory(product.category)}`);
      }
      if (existingProduct.category && existingProduct.category !== product.category) {
        revalidatePath(`/products/category/${slugifyCategory(existingProduct.category)}`);
      }
      revalidatePath("/shop");
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation error after product update:", e);
    }

    return privateJson(serializeProduct(product));
  } catch (error) {
    await cleanupBlob(createdBlobUrl);
    logServerError("admin_product_update_save", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;
  const rateLimit = await enforceRateLimit(request, "admin-product-delete", 30, 15 * 60_000, auth.session.user.email);
  if (rateLimit) return rateLimit;

  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  if (product.image) {
    await cleanupBlob(product.image);
  }
  logSecurityEvent("admin_product_removed", { actor: auth.session.user.email, productId: id });

  try {
    if (product.slug) {
      revalidatePath(`/products/${product.slug}`);
    }
    if (product.category) {
      revalidatePath(`/products/category/${slugifyCategory(product.category)}`);
    }
    revalidatePath("/shop");
    revalidatePath("/sitemap.xml");
    revalidatePath("/");
  } catch (e) {
    console.warn("Revalidation error after product delete:", e);
  }

  return privateJson(serializeProduct(product));
}
