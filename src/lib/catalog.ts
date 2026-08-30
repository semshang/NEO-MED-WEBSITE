import Product from "@/models/Product";
import { PRODUCT_SEED } from "@/data/products";

export async function ensureCatalogSeeded() {
  await Promise.all(
    PRODUCT_SEED.map((product) =>
      Product.updateOne(
        { slug: product.slug },
        { $setOnInsert: product },
        { upsert: true }
      )
    )
  );
}
