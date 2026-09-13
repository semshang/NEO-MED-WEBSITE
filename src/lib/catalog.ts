import "server-only";
import Product from "@/models/Product";
import { PRODUCT_SEED } from "@/data/products";

let seedPromise: Promise<void> | null = null;

export async function ensureCatalogSeeded() {
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
