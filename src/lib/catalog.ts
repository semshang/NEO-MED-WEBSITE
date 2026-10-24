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

function canUseReadOnlySeedFallback(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_SEED_CATALOG === "true";
}

function isDatabaseUnavailableError(error: unknown): boolean {
  const seen = new Set<unknown>();
  const parts: string[] = [];

  const visit = (value: unknown) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    if (typeof value === "string") {
      parts.push(value);
      return;
    }
    if (typeof value !== "object") return;
    const err = value as {
      name?: string;
      code?: number | string;
      codeName?: string;
      message?: string;
      cause?: unknown;
      errorLabelSet?: Set<string>;
      errorResponse?: { errmsg?: string; code?: number; codeName?: string };
    };
    if (err.name) parts.push(String(err.name));
    if (err.code !== undefined) parts.push(String(err.code));
    if (err.codeName) parts.push(err.codeName);
    if (err.message) parts.push(err.message);
    if (err.errorResponse?.errmsg) parts.push(err.errorResponse.errmsg);
    if (err.errorResponse?.codeName) parts.push(err.errorResponse.codeName);
    if (err.errorLabelSet instanceof Set) parts.push(...err.errorLabelSet);
    visit(err.cause);
  };

  visit(error);
  const text = parts.join(" ").toLowerCase();
  return /bad auth|authentication failed|atlaserror|enotfound|econnrefused|querysrv|server selection|mongodb_uri|handshakeerror/.test(
    text,
  );
}

let hasWarnedSeedFallback = false;

function logSeedFallback(error: unknown): void {
  if (hasWarnedSeedFallback) return;
  hasWarnedSeedFallback = true;
  const message = error instanceof Error ? error.message : "database unavailable";
  console.warn(
    `[Catalog] Database unavailable (${message}). Serving the local seed catalogue for read-only display. This does not restore MongoDB.`,
  );
}

function isActiveSeedProduct(product: (typeof PRODUCT_SEED)[number]): boolean {
  return product.isActive !== false && (product as { active?: boolean }).active !== false;
}

function seedToProduct(product: (typeof PRODUCT_SEED)[number]): ProductType {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    category: product.category,
    image: product.image || "",
    stock: product.stock ?? null,
    price: product.price ?? null,
    description: product.description || "",
    isActive: product.isActive !== false,
    active: product.isActive !== false,
  };
}

export function getSeedCatalogProducts(): ProductType[] {
  return PRODUCT_SEED.filter(isActiveSeedProduct).map(seedToProduct);
}

export function shouldServeLocalSeedCatalog(error: unknown): boolean {
  return canUseReadOnlySeedFallback() && isDatabaseUnavailableError(error);
}

async function withCatalogFallback<T>(operation: () => Promise<T>, fallback: () => T): Promise<T> {
  // Production must use MongoDB and propagate outages; never substitute local seed products.
  if (process.env.NODE_ENV === "production") {
    return await operation();
  }

  if (isSeedModeAllowed()) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    if (shouldServeLocalSeedCatalog(error)) {
      logSeedFallback(error);
      return fallback();
    }
    throw error;
  }
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

  // 3. Only seed in development or when explicitly enabled.
  // ALLOW_SEED_CATALOG is a read-only display fallback and must never authorize database writes.
  const isExplicitSeedEnabled =
    process.env.ALLOW_CATALOG_SEED === "true" ||
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

  return withCatalogFallback(
    async () => {
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
    },
    () => {
      const seed = getSeedProductBySlug(normalizedSlug);
      if (!seed || seed.isActive === false || (seed as { active?: boolean }).active === false) {
        return null;
      }
      return seed;
    },
  );
}

export async function getRelatedProducts(
  category: string,
  currentSlug: string,
  limit: number = 4
): Promise<ProductType[]> {
  const normalizedSlug = currentSlug.toLowerCase().trim();
  const seedRelated = (): ProductType[] => {
    const sameCat = PRODUCT_SEED.filter(
      (p) => p.category === category && p.slug !== normalizedSlug && isActiveSeedProduct(p),
    );
    const pool =
      sameCat.length >= limit
        ? sameCat
        : [
            ...sameCat,
            ...PRODUCT_SEED.filter((p) => p.slug !== normalizedSlug && isActiveSeedProduct(p)),
          ];
    return Array.from(new Map(pool.map((p) => [p.slug, p])).values())
      .slice(0, limit)
      .map(seedToProduct);
  };

  return withCatalogFallback<ProductType[]>(async () => {
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

    return docs.map((doc): ProductType => ({
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
  }, seedRelated);
}

export async function getProductsByCategory(category: string): Promise<ProductType[]> {
  if (!category) return [];
  const seedByCategory = () =>
    PRODUCT_SEED.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase() && isActiveSeedProduct(p),
    ).map(seedToProduct);

  return withCatalogFallback(async () => {
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
  }, seedByCategory);
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
  const seedSummaries = (): PublicProductSummary[] =>
    PRODUCT_SEED.filter(isActiveSeedProduct).map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      image: p.image,
      description: p.description,
      updatedAt: undefined,
    }));

  return withCatalogFallback(async () => {
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
  }, seedSummaries);
}

export async function getActiveCategoriesWithProducts(): Promise<string[]> {
  const seedCategories = () =>
    Array.from(
      new Set(
        PRODUCT_SEED.filter((p) => isActiveSeedProduct(p) && p.category && p.category !== "All Products").map(
          (p) => p.category,
        ),
      ),
    );

  return withCatalogFallback(async () => {
    await getConnectedDB();
    if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {
      await ensureCatalogSeeded();
    }

    const distinct = await Product.distinct("category", { isActive: { $ne: false }, active: { $ne: false } });
    return distinct.filter((c): c is string => typeof c === "string" && Boolean(c) && c !== "All Products");
  }, seedCategories);
}
