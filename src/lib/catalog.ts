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

let hasWarnedEmptyCatalog = false;

function logEmptyProductionCatalogWarning(): void {
  if (process.env.NODE_ENV === "production" && !hasWarnedEmptyCatalog) {
    hasWarnedEmptyCatalog = true;
    console.warn("[Catalog] Production database product collection is empty. Returning empty catalogue without seeding.");
  }
}

export async function ensureCatalogSeeded(): Promise<void> {
  // 1. Strictly forbid automatic seeding in production
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_CATALOG_SEED !== "true") {
    return;
  }

  // 2. Offline mock/test mode without MongoDB does not need database seeding
  if (isSeedModeAllowed()) {
    return;
  }

  // 3. Only seed in development or when explicitly enabled
  const isExplicitSeedEnabled =
    process.env.ALLOW_CATALOG_SEED === "true" ||
    process.env.ALLOW_SEED_CATALOG === "true" ||
    process.env.NODE_ENV === "development";

  if (!isExplicitSeedEnabled) {
    return;
  }

  await getConnectedDB();

  if (!seedPromise) {
    seedPromise = (async () => {
      const exists = await Product.exists({});
      if (exists) return;

      console.info("[Catalog] Explicitly bootstrapping product catalogue in database...");
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
    const seed = getSeedProductBySlug(normalizedSlug);
    if (!seed || seed.isActive === false || (seed as { active?: boolean }).active === false) {
      return null;
    }
    return seed;
  }

  // 2. Authoritative Database Lookup
  // Any connection or query failure propagates an error and does NOT return null or seed data.
  await getConnectedDB();
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }

  const doc = await Product.findOne({
    slug: normalizedSlug,
    isActive: { $ne: false },
    active: { $ne: false },
  }).lean<IProduct>();

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
    isActive: doc.isActive !== false && doc.active !== false,
    active: doc.isActive !== false && doc.active !== false,
    seoTitle: doc.seoTitle || "",
    seoDescription: doc.seoDescription || "",
    shortDescription: doc.shortDescription || "",
    detailedDescription: doc.detailedDescription || "",
    brand: doc.brand || "",
    model: doc.model || "",
    features: doc.features || [],
    applications: doc.applications || [],
    specifications: doc.specifications?.map((s) => ({ label: s.label, value: s.value })) || [],
    warranty: doc.warranty || "",
    installationSupport: doc.installationSupport || "",
    deliveryInformation: doc.deliveryInformation || "",
    faq: doc.faq?.map((f) => ({ question: f.question, answer: f.answer })) || [],
    imageAlt: doc.imageAlt || "",
  };
}

export async function getRelatedProducts(
  category: string,
  currentSlug: string,
  limit: number = 4
): Promise<ProductType[]> {
  const normalizedSlug = currentSlug.toLowerCase().trim();
  if (isSeedModeAllowed()) {
    const sameCat = PRODUCT_SEED.filter(
      (p) =>
        p.category === category &&
        p.slug !== normalizedSlug &&
        p.isActive !== false &&
        (p as { active?: boolean }).active !== false
    );
    const pool =
      sameCat.length >= limit
        ? sameCat
        : [
            ...sameCat,
            ...PRODUCT_SEED.filter(
              (p) =>
                p.slug !== normalizedSlug &&
                p.isActive !== false &&
                (p as { active?: boolean }).active !== false
            ),
          ];
    const unique = Array.from(new Map(pool.map((p) => [p.slug, p])).values()).slice(0, limit);
    return unique.map((p) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      category: p.category,
      image: p.image,
      stock: p.stock,
      price: p.price,
      description: p.description,
      isActive: p.isActive,
      active: p.isActive,
    }));
  }

  await getConnectedDB();
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }
  const sameCatDocs = await Product.find({
    category,
    slug: { $ne: normalizedSlug },
    isActive: { $ne: false },
    active: { $ne: false },
  })
    .sort({ name: 1 })
    .limit(limit)
    .lean<IProduct[]>();

  let docs = sameCatDocs;
  if (docs.length < limit) {
    const needed = limit - docs.length;
    const existingSlugs = [normalizedSlug, ...docs.map((d) => d.slug)];
    const fallbackDocs = await Product.find({
      slug: { $nin: existingSlugs },
      isActive: { $ne: false },
      active: { $ne: false },
    })
      .sort({ name: 1 })
      .limit(needed)
      .lean<IProduct[]>();
    docs = [...docs, ...fallbackDocs];
  }

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    image: doc.image || "",
    stock: doc.stock ?? null,
    price: doc.price ?? null,
    description: doc.description || "",
    isActive: doc.isActive !== false && doc.active !== false,
    active: doc.isActive !== false && doc.active !== false,
    brand: doc.brand || "",
    model: doc.model || "",
  }));
}

export async function getProductsByCategory(category: string): Promise<ProductType[]> {
  if (!category) return [];
  if (isSeedModeAllowed()) {
    return PRODUCT_SEED.filter(
      (p) =>
        p.category.toLowerCase() === category.toLowerCase() &&
        p.isActive !== false &&
        (p as { active?: boolean }).active !== false
    ).map((p) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      category: p.category,
      image: p.image,
      stock: p.stock,
      price: p.price,
      description: p.description,
      isActive: p.isActive,
      active: p.isActive,
    }));
  }

  await getConnectedDB();
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }
  const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const docs = await Product.find({
    category: { $regex: new RegExp(`^${escaped}$`, "i") },
    isActive: { $ne: false },
    active: { $ne: false },
  })
    .sort({ name: 1 })
    .lean<IProduct[]>();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    image: doc.image || "",
    stock: doc.stock ?? null,
    price: doc.price ?? null,
    description: doc.description || "",
    isActive: doc.isActive !== false && doc.active !== false,
    active: doc.isActive !== false && doc.active !== false,
    seoTitle: doc.seoTitle || "",
    seoDescription: doc.seoDescription || "",
    shortDescription: doc.shortDescription || "",
    detailedDescription: doc.detailedDescription || "",
    brand: doc.brand || "",
    model: doc.model || "",
    features: doc.features || [],
    applications: doc.applications || [],
    specifications: doc.specifications?.map((s) => ({ label: s.label, value: s.value })) || [],
    warranty: doc.warranty || "",
    installationSupport: doc.installationSupport || "",
    deliveryInformation: doc.deliveryInformation || "",
    faq: doc.faq?.map((f) => ({ question: f.question, answer: f.answer })) || [],
    imageAlt: doc.imageAlt || "",
  }));
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
    return PRODUCT_SEED.filter(
      (p) => p.isActive !== false && (p as { active?: boolean }).active !== false
    ).map((p) => ({
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
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }

  const docs = await Product.find({ isActive: { $ne: false }, active: { $ne: false } })
    .sort({ category: 1, name: 1 })
    .lean<Array<IProduct & { updatedAt?: Date | string }>>();

  if (docs.length === 0) {
    logEmptyProductionCatalogWarning();
    return [];
  }

  return docs.map((d) => ({
    slug: d.slug || slugifyProduct(d.name),
    name: d.name,
    category: d.category,
    image: d.image || "",
    description: d.description || "",
    updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
  }));
}

export async function getActiveCategoriesWithProducts(): Promise<string[]> {
  if (isSeedModeAllowed()) {
    const categoriesWithProducts = new Set(
      PRODUCT_SEED.filter(
        (p) =>
          p.isActive !== false &&
          (p as { active?: boolean }).active !== false &&
          p.category &&
          p.category !== "All Products"
      ).map((p) => p.category)
    );
    return Array.from(categoriesWithProducts);
  }

  await getConnectedDB();
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
    await ensureCatalogSeeded();
  }

  const distinct = await Product.distinct("category", { isActive: { $ne: false }, active: { $ne: false } });
  return distinct.filter((c): c is string => typeof c === "string" && Boolean(c) && c !== "All Products");
}
