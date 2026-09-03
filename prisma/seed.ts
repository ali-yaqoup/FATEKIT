import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "Skipping admin user: set ADMIN_EMAIL and ADMIN_PASSWORD in .env"
    );
  } else if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  } else {
    const passwordHash = bcrypt.hashSync(adminPassword, 12);

    await db.adminUser.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: process.env.ADMIN_NAME?.trim() || "مدير المتجر",
        email: adminEmail,
        passwordHash,
        role: AdminRole.OWNER,
      },
    });
  }

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
      heroSubtitle: "مكياج وعناية من أرقى البراندات العالمية، مختارة لكِ في فلسطين.",
      heroPrimaryLabel: "تسوقي الآن",
      promoText: "براندات عالمية • منتجات أصلية • الدفع عند الاستلام",
      promoActive: true,
      statementText: "متجر يختار لكِ أفضل براندات المكياج العالمية، لتبرزي إطلالتكِ بطريقتكِ.",
      statementActive: true,
      instagramTitle: "إطلالات العميلات",
      instagramActive: true,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
