import "server-only";
import Product, { type IProduct } from "@/models/Product";
import { PRODUCT_SEED } from "@/data/products";
import type { Product as ProductType } from "@/lib/store-types";
import { getSeedProductBySlug, slugifyProduct } from "@/lib/product-slugs";

export { slugifyProduct };

let seedPromise: Promise<void> | null = null;

function isSeedModeAllowed(): boolean {
  // Seed fallback is strictly isolated to test runners or explicit test opt-in.
  // It is NEVER permitted in production or when a database connection is expected.
  return (
    !process.env.MONGODB_URI &&
    (process.env.NODE_ENV === "test" || process.env.ALLOW_SEED_CATALOG === "true")
  );
}

async function getConnectedDB(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database configuration MONGODB_URI is required in production environment.");
    }
    if (isSeedModeAllowed()) {
      return;
    }
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  const { default: connectDB } = await import("@/lib/mongoose");
  await connectDB();
}

export async function ensureCatalogSeeded() {
  if (isSeedModeAllowed()) return;
  await getConnectedDB();

  if (!seedPromise) {
    seedPromise = (async () => {
      if (await Product.exists({})) return;
      await Product.bulkWrite(
        PRODUCT_SEED.map((product) => ({
          updateOne: {
            filter: { slug: product.slug },
            update: { $setOnInsert: product },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  if (!slug || typeof slug !== "string") return null;
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Isolated test/mock mode (only when no MONGODB_URI is configured and in test environment)
  if (isSeedModeAllowed()) {
    return getSeedProductBySlug(normalizedSlug);
  }

  // 2. Authoritative Database Lookup
  // Any connection or query failure propagates an error and does NOT return null or seed data.
  await getConnectedDB();

  const doc = await Product.findOne({ slug: normalizedSlug, isActive: true }).lean<IProduct>();
  if (!doc) {
    // Successful database query with no active product matching this slug: authoritative not found
    return null;
  }

  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    image: doc.image || "",
    stock: doc.stock ?? null,
    price: doc.price ?? null,
    description: doc.description || "",
    isActive: doc.isActive !== false,
  };
}

export interface PublicProductSummary {
  slug: string;
  name: string;
  category: string;
  image: string;
  description: string;
  updatedAt?: Date;
}

export async function getAllPublicProducts(): Promise<PublicProductSummary[]> {
  // 1. Isolated test/mock mode (only when no MONGODB_URI is configured and in test environment)
  if (isSeedModeAllowed()) {
    return PRODUCT_SEED.filter((p) => p.isActive !== false).map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      image: p.image,
      description: p.description,
      updatedAt: undefined,
    }));
  }

  // 2. Authoritative Database Lookup
  // Any connection or query failure propagates an error and does NOT return an empty array or seed data.
  await getConnectedDB();

  const docs = await Product.find({ isActive: true })
    .sort({ category: 1, name: 1 })
    .lean<Array<IProduct & { updatedAt?: Date | string }>>();

  return docs.map((d) => ({
    slug: d.slug || slugifyProduct(d.name),
    name: d.name,
    category: d.category,
    image: d.image || "",
    description: d.description || "",
    updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
  }));
}
