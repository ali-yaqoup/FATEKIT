import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany();
  console.log(products.map(p => p.name).join('\n'));
}

main().catch(console.error);
