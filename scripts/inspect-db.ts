import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
  const featured = await db.featuredCategory.findMany({ include: { category: true } });
  const ig = await db.instagramImage.findMany();
  const home = await db.homepageContent.findUnique({ where: { id: "main" } });
  const settings = await db.storeSettings.findUnique({ where: { id: "main" } });
  const admins = await db.adminUser.findMany({ select: { email: true, name: true, role: true } });

  const counts = {
    products: await db.product.count(),
    images: await db.productImage.count(),
    categories: await db.category.count(),
    orders: await db.order.count(),
    customers: await db.customer.count(),
    coupons: await db.coupon.count(),
  };

  console.log(
    JSON.stringify(
      {
        counts,
        admins,
        settings: settings && {
          storeName: settings.storeName,
          phone: settings.phone,
          deliveryFee: settings.deliveryFee,
          freeShippingMinimum: settings.freeShippingMinimum,
        },
        home: home && { heroImageUrl: home.heroImageUrl, heroTitle: home.heroTitle },
        featured: featured.map((f) => ({
          name: f.category.name,
          slug: f.category.slug,
          imageUrl: f.imageUrl,
        })),
        instagram: ig.map((i) => i.imageUrl),
        products: products.map((p) => ({
          name: p.name,
          slug: p.slug,
          category: p.category.name,
          catSlug: p.category.slug,
          images: p.images.map((i) => i.url),
          variants: p.variants.map((v) => ({ name: v.name, imageUrl: v.imageUrl })),
        })),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
