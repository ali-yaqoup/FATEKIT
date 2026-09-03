import { copyFile, unlink } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const product = await db.product.findFirst({
    where: { slug: "علي-ضرار-علي-يعقوب" },
    include: { images: true, variants: true },
  });

  if (!product) {
    console.log("Test product not found");
    return;
  }

  const src = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    "classic-matte-lipstick-1.jpg"
  );
  const dest = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    "custom-product-1.jpg"
  );
  await copyFile(src, dest);
  const url = "/uploads/products/custom-product-1.jpg";

  await db.productImage.deleteMany({ where: { productId: product.id } });
  await db.productImage.create({
    data: { productId: product.id, url, sortOrder: 0 },
  });
  for (const variant of product.variants) {
    await db.productVariant.update({
      where: { id: variant.id },
      data: { imageUrl: url },
    });
  }

  const arabicFile = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    "علي-ضرار-علي-يعقوب-1.jpg"
  );
  await unlink(arabicFile).catch(() => undefined);

  console.log("Updated leftover product", product.name, "->", url);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
