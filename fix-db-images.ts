import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({
    where: {
      url: {
        contains: 'pollinations.ai'
      }
    }
  });

  console.log(`Found ${images.length} images to update in ProductImage`);

  for (const img of images) {
    await prisma.productImage.update({
      where: { id: img.id },
      data: { url: 'https://picsum.photos/seed/placeholder/800/800' }
    });
  }

  const homepage = await prisma.homepageContent.findUnique({ where: { id: "main" } });
  if (homepage?.heroImageUrl?.includes('pollinations.ai')) {
    await prisma.homepageContent.update({
      where: { id: "main" },
      data: { heroImageUrl: 'https://picsum.photos/seed/placeholder/1920/1080' }
    });
    console.log('Updated homepage hero image');
  }
  
  const categories = await prisma.category.findMany({
    where: {
      imageUrl: {
        contains: 'pollinations.ai'
      }
    }
  });
  console.log(`Found ${categories.length} images to update in Category`);
  for (const cat of categories) {
    await prisma.category.update({
      where: { id: cat.id },
      data: { imageUrl: 'https://picsum.photos/seed/placeholder/800/800' }
    });
  }
  
  const featured = await prisma.featuredCategory.findMany({
    where: {
      imageUrl: {
        contains: 'pollinations.ai'
      }
    }
  });
  console.log(`Found ${featured.length} images to update in FeaturedCategory`);
  for (const f of featured) {
    await prisma.featuredCategory.update({
      where: { id: f.id },
      data: { imageUrl: 'https://picsum.photos/seed/placeholder/800/800' }
    });
  }

  console.log('Done');
}

main().catch(console.error).finally(() => prisma.$disconnect());
