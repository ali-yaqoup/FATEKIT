import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PRODUCT_IMAGES: Record<string, string[]> = {
  "classic-matte-lipstick": [
    "https://images.pexels.com/photos/850801/pexels-photo-850801.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/7667674/pexels-photo-7667674.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "luminous-liquid-foundation": [
    "https://images.pexels.com/photos/5403543/pexels-photo-5403543.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/10107538/pexels-photo-10107538.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "velvet-compact-powder": [
    "https://images.pexels.com/photos/7670767/pexels-photo-7670767.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/17679435/pexels-photo-17679435.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "crystal-shine-lipgloss": [
    "https://images.pexels.com/photos/37195158/pexels-photo-37195158.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/29229051/pexels-photo-29229051.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "velvet-full-coverage-concealer": [
    "https://images.pexels.com/photos/7256092/pexels-photo-7256092.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/13964073/pexels-photo-13964073.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "precision-liquid-eyeliner": [
    "https://images.pexels.com/photos/2697786/pexels-photo-2697786.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/10681654/pexels-photo-10681654.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "dramatic-volume-mascara": [
    "https://images.pexels.com/photos/2637820/pexels-photo-2637820.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "hyaluronic-glowing-serum": [
    "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "rose-velvet-moisturizer": [
    "https://images.pexels.com/photos/4841466/pexels-photo-4841466.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/24602074/pexels-photo-24602074.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "silk-velvet-blush": [
    "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/17354882/pexels-photo-17354882.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "precision-contour-lip-liner": [
    "https://images.pexels.com/photos/7588573/pexels-photo-7588573.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/29709955/pexels-photo-29709955.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  "smoky-eyeshadow-palette": [
    "https://images.pexels.com/photos/7588613/pexels-photo-7588613.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/37442204/pexels-photo-37442204.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
};

const INSTAGRAM_IMAGES = [
  "https://images.pexels.com/photos/850801/pexels-photo-850801.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7588613/pexels-photo-7588613.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800",
];

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "FATEKIT-image-sync/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Failed ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
}

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });

  const products = await db.product.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
  });

  for (const product of products) {
    const sources = PRODUCT_IMAGES[product.slug];
    if (!sources) {
      console.warn("No mapping for", product.slug);
      continue;
    }

    const localUrls: string[] = [];
    for (let i = 0; i < sources.length; i++) {
      const filename = `${product.slug}-${i + 1}.jpg`;
      const dest = path.join(dir, filename);
      console.log("Downloading", product.slug, i + 1);
      await downloadImage(sources[i], dest);
      localUrls.push(`/uploads/products/${filename}`);
    }

    await db.productImage.deleteMany({ where: { productId: product.id } });
    await db.productImage.createMany({
      data: localUrls.map((url, index) => ({
        productId: product.id,
        url,
        sortOrder: index,
      })),
    });

    if (product.variants.length > 0) {
      for (const variant of product.variants) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: { imageUrl: localUrls[0] },
        });
      }
    }
  }

  const instagram = await db.instagramImage.findMany({ orderBy: { sortOrder: "asc" } });
  for (let i = 0; i < instagram.length; i++) {
    const filename = `instagram-${i + 1}.jpg`;
    const dest = path.join(dir, filename);
    await downloadImage(INSTAGRAM_IMAGES[i % INSTAGRAM_IMAGES.length], dest);
    await db.instagramImage.update({
      where: { id: instagram[i].id },
      data: { imageUrl: `/uploads/products/${filename}` },
    });
  }

  console.log("Product and Instagram images updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
