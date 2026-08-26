import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("admin123", 10);

  await db.adminUser.upsert({
    where: { email: "admin@fatekit.com" },
    update: {},
    create: {
      name: "مدير المتجر",
      email: "admin@fatekit.com",
      passwordHash,
      role: AdminRole.OWNER,
    },
  });

  await db.storeSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      storeName: "FATEKIT",
      phone: "+970 599 000 000",
      email: "contact@fatekit.com",
      whatsapp: "+970 599 000 000",
      deliveryFee: 30,
      freeShippingMinimum: 350,
      deliveryAreas: [
        "القدس",
        "رام الله والبيرة",
        "نابلس",
        "الخليل",
        "بيت لحم",
        "جنين",
        "طولكرم",
        "قلقيلية",
        "أريحا والأغوار",
        "سلفيت",
        "طوباس",
      ],
    },
  });

  await db.homepageContent.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      heroTitle: "اكتشفي جمالكِ بطريقتك",
      heroSubtitle: "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى.",
      heroPrimaryLabel: "تسوقي الآن",
      promoText: "توصيل سريع • منتجات أصلية • الدفع عند الاستلام",
      promoActive: true,
      statementText: "نؤمن بأن الجمال الفاخر هو احتفاء بتميّزكِ، لا بتقليد أحد.",
      statementActive: true,
      instagramTitle: "إطلالات العميلات",
      instagramActive: true,
    },
  });

  console.log("Seed complete. Admin login: admin@fatekit.com / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
