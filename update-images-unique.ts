import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('Fetching and updating images with unique seeds...');
  
  // ProductImage
  const images = await db.productImage.findMany();
  for (let i = 0; i < images.length; i++) {
    await db.productImage.update({
      where: { id: images[i].id },
      data: { url: `https://picsum.photos/seed/${images[i].id}/800/800` }
    });
  }

  // FeaturedCategory
  const featured = await db.featuredCategory.findMany();
  for (let i = 0; i < featured.length; i++) {
    await db.featuredCategory.update({
      where: { id: featured[i].id },
      data: { imageUrl: `https://picsum.photos/seed/cat_${featured[i].id}/800/800` }
    });
  }

  // HomepageContent
  const content = await db.homepageContent.findMany();
  for (let i = 0; i < content.length; i++) {
    await db.homepageContent.update({
      where: { id: content[i].id },
      data: { 
        heroImageUrl: `https://picsum.photos/seed/hero_${content[i].id}/1920/1080`,
        statementImageUrl: `https://picsum.photos/seed/stmt_${content[i].id}/800/800`
      }
    });
  }

  // ProductVariant
  const variants = await db.productVariant.findMany();
  for (let i = 0; i < variants.length; i++) {
    await db.productVariant.update({
      where: { id: variants[i].id },
      data: { imageUrl: `https://picsum.photos/seed/var_${variants[i].id}/800/800` }
    });
  }
  
  console.log('Done updating unique images!');
}

main().catch(console.error);
