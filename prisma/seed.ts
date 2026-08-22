import { PrismaClient, OrderStatus, CouponType, AdminRole, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting FATEKIT database seed...");

  // Clear existing data in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.featuredCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.instagramImage.deleteMany();
  await prisma.homepageContent.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("🧹 Cleared existing records.");

  // 1. Categories & Subcategories
  const mainCategories = [
    {
      name: "الوجه",
      slug: "face",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      sortOrder: 1,
      children: [
        { name: "كريم أساس", slug: "foundation", sortOrder: 1 },
        { name: "كونسيلر", slug: "concealer", sortOrder: 2 },
        { name: "بودرة الوجه", slug: "face-powder", sortOrder: 3 },
        { name: "بلاش وهايلايتر", slug: "blush-highlighter", sortOrder: 4 },
      ],
    },
    {
      name: "العيون",
      slug: "eyes",
      imageUrl: "https://images.unsplash.com/photo-1583241799080-311e63251c14?w=800&auto=format&fit=crop&q=80",
      sortOrder: 2,
      children: [
        { name: "ظلال العيون", slug: "eyeshadow", sortOrder: 1 },
        { name: "محدد العيون", slug: "eyeliner", sortOrder: 2 },
        { name: "ماسكارا", slug: "mascara", sortOrder: 3 },
      ],
    },
    {
      name: "الشفاه",
      slug: "lips",
      imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
      sortOrder: 3,
      children: [
        { name: "أحمر شفاه", slug: "lipstick", sortOrder: 1 },
        { name: "ملمع شفاه", slug: "lipgloss", sortOrder: 2 },
        { name: "محدد شفاه", slug: "lipliner", sortOrder: 3 },
      ],
    },
    {
      name: "البشرة",
      slug: "skincare",
      imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
      sortOrder: 4,
      children: [
        { name: "سيروم مغذي", slug: "serum", sortOrder: 1 },
        { name: "مرطب فاخر", slug: "moisturizer", sortOrder: 2 },
        { name: "تونر ومنظف", slug: "cleanser-toner", sortOrder: 3 },
      ],
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of mainCategories) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, parent.id);

    for (const child of cat.children) {
      const sub = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          sortOrder: child.sortOrder,
          isActive: true,
        },
      });
      categoryMap.set(child.slug, sub.id);
    }
  }

  console.log("✅ Created main categories and subcategories.");

  // 2. Products with variants & images
  const productsData = [
    {
      name: "أحمر شفاه كلاسيكي مات",
      slug: "classic-matte-lipstick",
      brand: "FATEKIT",
      categorySlug: "lipstick",
      price: 150.0,
      compareAtPrice: 185.0,
      discountPercent: 19,
      description: "أحمر شفاه بتركيبة كريمية مطفية تمنحكِ تغطية كاملة ولوناً غنياً يدوم طويلاً دون التسبب في جفاف الشفاه. غني بزيت الجوجوبا للترطيب العميق.",
      ingredients: "زيت الجوجوبا، فيتامين E، شمع النحل الطبيعي، صبغات غنية مستخلصة.",
      usageInstructions: "ضعي أحمر الشفاه مباشرة من الأنبوب ابدئي من المنتصف باتجاه الزوايا الخارجية.",
      details: "الوزن: 3.8 غرام • لمسة مطفية مخملية • خالي من البارابين.",
      isFeatured: true,
      isBestseller: true,
      isNew: true,
      sku: "LIP-MAT-01",
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "01 Nude Velvet", colorCode: "#C58C7E", price: 150.0, sku: "LIP-MAT-01-NUDE", quantity: 35, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80" },
        { name: "02 Ruby Red", colorCode: "#800020", price: 150.0, sku: "LIP-MAT-01-RUBY", quantity: 20, imageUrl: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=800&auto=format&fit=crop&q=80" },
        { name: "03 Rose Touch", colorCode: "#B76E79", price: 150.0, sku: "LIP-MAT-01-ROSE", quantity: 15, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "كريم أساس سائل فائق النعومة",
      slug: "luminous-liquid-foundation",
      brand: "FATEKIT",
      categorySlug: "foundation",
      price: 220.0,
      compareAtPrice: 260.0,
      discountPercent: 15,
      description: "كريم أساس سائل بقوام حريري خفيف يمتزج بسلاسة مع البشرة لتوفير تغطية طبيعية متوسطة إلى كاملة تدوم حتى 16 ساعة مع إشراقة مخملية راقية.",
      ingredients: "ماء نقي، حمض الهيالورونيك، خلاصة البابونج، نياسيناميد.",
      usageInstructions: "ضعي قطرات قليلة على مركز الوجه وازيجيه للخارج باستخدام الفرشاة أو الإسفنجة.",
      details: "الحجم: 30 مل • مناسب لجميع أنواع البشرة • حماية SPF 20.",
      isFeatured: true,
      isBestseller: true,
      isNew: false,
      sku: "FDN-LUM-01",
      images: [
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Ivory Glow - 01", colorCode: "#F5E0D3", price: 220.0, sku: "FDN-LUM-01-IVORY", quantity: 25, imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80" },
        { name: "Warm Beige - 02", colorCode: "#E2C4B1", price: 220.0, sku: "FDN-LUM-01-BEIGE", quantity: 18, imageUrl: "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800&auto=format&fit=crop&q=80" },
        { name: "Honey Amber - 03", colorCode: "#CBA388", price: 220.0, sku: "FDN-LUM-01-HONEY", quantity: 4, imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "بودرة مضغوطة مخملية",
      slug: "velvet-compact-powder",
      brand: "FATEKIT",
      categorySlug: "face-powder",
      price: 185.0,
      compareAtPrice: null,
      discountPercent: null,
      description: "بودرة مضغوطة فاخرة تمنح بشرتكِ لمسة نهائية متجانسة وخالية من اللمعان الزائد دون تكتل.",
      ingredients: "تلك نقي، ميش ميكرو، زيوات طبيعية مغذية.",
      usageInstructions: "استخدمي الإسفنجة المرفقة للتطبيق المتساوي على كامل الوجه.",
      details: "الوزن: 12 غرام • لمسة مطفية شافة • مناسبة لتثبيت المكياج.",
      isFeatured: true,
      isBestseller: false,
      isNew: true,
      sku: "PWD-VEL-01",
      images: [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Light Silk", colorCode: "#F6E7D8", price: 185.0, sku: "PWD-VEL-01-LIGHT", quantity: 30, imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80" },
        { name: "Medium Sand", colorCode: "#E4CAAF", price: 185.0, sku: "PWD-VEL-01-MEDIUM", quantity: 2, imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "لوحة ظلال عيون سموكي مونوكروم",
      slug: "smoky-eyeshadow-palette",
      brand: "FATEKIT",
      categorySlug: "eyeshadow",
      price: 240.0,
      compareAtPrice: 280.0,
      discountPercent: 14,
      description: "باليت عيون فاخرة تحتوي على 12 لوناً بدرجات مطفية ولامعة فاخرة لابتكار إطلالات عيون ساحرة من النهار إلى الليل.",
      ingredients: "ميكا، صبغات معدنية، زيت الأرجان المغذي.",
      usageInstructions: "استخدمي الفرشاة لتطبيق الألوان الفاتحة كقاعدة، ثم التدرج بالدرجات الداكنة للثنيات.",
      details: "12 لون حظيري • مرآة مدمجة • ثبات فائق طوال اليوم.",
      isFeatured: true,
      isBestseller: true,
      isNew: true,
      sku: "EYE-PAL-SMK",
      quantity: 45, // Direct quantity (no variants)
      images: [
        "https://images.unsplash.com/photo-1583241799080-311e63251c14?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [],
    },
    {
      name: "محدد عيون سائل دقيق المقاوم للماء",
      slug: "precision-liquid-eyeliner",
      brand: "FATEKIT",
      categorySlug: "eyeliner",
      price: 110.0,
      compareAtPrice: null,
      discountPercent: null,
      description: "آيلاينر سائل برأس دقيق فائق المرونة يرسم خطوطاً حادة بسواد فاحم يدوم طوال اليوم دون تلطخ.",
      ingredients: "صبغات الكربون الأسود، بوليمرات مقاومة للماء.",
      usageInstructions: "ارسمي خطاً ناعماً محاذياً لخط الرموش العلوي ومرريه بلطف نحو الزاوية الخارجية.",
      details: "اللون: أسود داكن جداً • مقاوم للماء والتعرق • يجف بسرعة فائقة.",
      isFeatured: false,
      isBestseller: true,
      isNew: false,
      sku: "EYE-LIN-BLK",
      quantity: 50,
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [],
    },
    {
      name: "ماسكارا تكثيف الرموش الفائقة",
      slug: "dramatic-volume-mascara",
      brand: "FATEKIT",
      categorySlug: "mascara",
      price: 130.0,
      compareAtPrice: 150.0,
      discountPercent: 13,
      description: "ماسكارا تمنح رموشكِ حجماً مضاعفاً وطولاً استثنائياً مع فرشاة مبتكرة تغلف كل رمش بدقة من الجذور إلى الأطراف.",
      ingredients: "شمع الكارنوبا، كولاجين نباتي، صبغات معدنية داكنة.",
      usageInstructions: "مرري الفرشاة من قاعدة الرموش حتى أطرافها بحركة متعرجة لتغطية مثالية.",
      details: "سواد فاحم • خالية من التكتل • تدوم حتى 24 ساعة.",
      isFeatured: false,
      isBestseller: true,
      isNew: true,
      sku: "EYE-MSC-VOL",
      quantity: 60,
      images: [
        "https://images.unsplash.com/photo-1560700325-1e35d1f88eb2?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [],
    },
    {
      name: "ملمع شفاه كريستالي مضيء",
      slug: "crystal-shine-lipgloss",
      brand: "FATEKIT",
      categorySlug: "lipgloss",
      price: 125.0,
      compareAtPrice: null,
      discountPercent: null,
      description: "ملمع شفاه يمنح لمسها لمعاناً مائياً براقاً مع إحساس خفيف وغير لزج ورائحة الفانيليا الفاخرة.",
      ingredients: "زيت الكوكوت، حمض الهيالورونيك، ميكا براقة.",
      usageInstructions: "طبقي الملمع بمفرده لإطلالة طبيعية أو فوق أحمر الشفاه لإضافة لمس براقة.",
      details: "لمعان كريستالي • تركيبة مغذية ممتلئة • غير لزج.",
      isFeatured: true,
      isBestseller: false,
      isNew: true,
      sku: "LIP-GLS-01",
      images: [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Clear Diamond", colorCode: "#FFFFFF", price: 125.0, sku: "LIP-GLS-01-CLEAR", quantity: 30, imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80" },
        { name: "Rose Shimmer", colorCode: "#FFB6C1", price: 125.0, sku: "LIP-GLS-01-ROSE", quantity: 22, imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "كونسيلر إخفاء العيوب المخملي",
      slug: "velvet-full-coverage-concealer",
      brand: "FATEKIT",
      categorySlug: "concealer",
      price: 140.0,
      compareAtPrice: 165.0,
      discountPercent: 15,
      description: "خافي عيوب عالي التغطية يخفي الهالات السوداء والشوائب بأسلوب طبيعي ومخملي دون استقرار في الخطوط الدقيقة.",
      ingredients: "فيتامين C، خلاصة العرقسوس، صبغات عالية الكثافة.",
      usageInstructions: "ضعي نقاطاً صغيرة تحت العينين وعلى البقع، واعتمدي الطبطبة بالإصبع أو الفرشاة.",
      details: "تغطية كاملة 24 ساعة • مقاوم للتجعد • تركيبة خفيفة.",
      isFeatured: false,
      isBestseller: true,
      isNew: false,
      sku: "CNC-VEL-01",
      images: [
        "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Light Cream", colorCode: "#FFF0E5", price: 140.0, sku: "CNC-VEL-01-LIGHT", quantity: 18, imageUrl: "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800&auto=format&fit=crop&q=80" },
        { name: "Natural Honey", colorCode: "#E8D3C3", price: 140.0, sku: "CNC-VEL-01-HONEY", quantity: 3, imageUrl: "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "سيروم النضارة والإشراق بالهيالورونيك",
      slug: "hyaluronic-glowing-serum",
      brand: "FATEKIT",
      categorySlug: "serum",
      price: 260.0,
      compareAtPrice: 300.0,
      discountPercent: 13,
      description: "سيروم مكثف يعيد حيوية ونضارة البشرة بفضل احتوائه على حمض الهيالورونيك متعدد الأوزان الجزيئية وفيتامين E النقي.",
      ingredients: "حمض الهيالورونيك الثلاثي، فيتامين C النقي، ببتيدات تجديد الخلايا.",
      usageInstructions: "ضعي 3 إلى 4 قطرات صباحاً ومساءً على بشرة نظيفة قبل المرطب.",
      details: "حجم: 50 مل • مناسب للبشرة الحساسة • نتائج ملحوظة خلال 7 أيام.",
      isFeatured: true,
      isBestseller: true,
      isNew: true,
      sku: "SKN-SRM-HYA",
      quantity: 40,
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [],
    },
    {
      name: "مرطب البشرة الفاخر بزبدة الشيا والورد",
      slug: "rose-velvet-moisturizer",
      brand: "FATEKIT",
      categorySlug: "moisturizer",
      price: 210.0,
      compareAtPrice: null,
      discountPercent: null,
      description: "كريم ترطيب غني يمنح البشرة الجافة والعادية تغذية عميقة وحماية من العوامل البيئية مع عطر الورد الطبيعي الرقيق.",
      ingredients: "زبدة الشيا العضوية، ماء الورد الجوري، سيراميدات حماية حاجز البشرة.",
      usageInstructions: "يدلك على الوجه والرقبة بحركات دائرية صاعدة حتى الامتصاص الكامل.",
      details: "حجم: 60 غرام • خالي من المواد الكيميائية الضارة • ملمس مخملي.",
      isFeatured: false,
      isBestseller: false,
      isNew: true,
      sku: "SKN-MST-RSE",
      quantity: 35,
      images: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [],
    },
    {
      name: "بلاش خدود مخملي حريري",
      slug: "silk-velvet-blush",
      brand: "FATEKIT",
      categorySlug: "blush-highlighter",
      price: 160.0,
      compareAtPrice: 190.0,
      discountPercent: 16,
      description: "أحمر خدود بتركيبة بودرة حريرية فائقة التمازج توفر حمرة طبيعية متوهجة تبرز جمال وجنتيكِ بلمسة فاخرة.",
      ingredients: "ميكا، زيوت نباتية مرطبة، أصباغ وردية معدنية.",
      usageInstructions: "وزعي البودرة على تفاحتي الخدين باستخدام فرشاة البلاش الخاصة.",
      details: "الوزن: 8 غرام • ثبات يدوم 12 ساعة • ألوان مفعمة بالحيوية.",
      isFeatured: true,
      isBestseller: false,
      isNew: false,
      sku: "FAC-BLS-01",
      images: [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Peach Blossom", colorCode: "#FFB07C", price: 160.0, sku: "FAC-BLS-01-PEACH", quantity: 20, imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80" },
        { name: "Soft Coral", colorCode: "#F88379", price: 160.0, sku: "FAC-BLS-01-CORAL", quantity: 15, imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80" },
      ],
    },
    {
      name: "محدد شفاه دقيق مقاوم للتلطخ",
      slug: "precision-contour-lip-liner",
      brand: "FATEKIT",
      categorySlug: "lipliner",
      price: 95.0,
      compareAtPrice: null,
      discountPercent: null,
      description: "قلم تحديد الشفاه بقوام كريمي ينزلق بسهولة ليعرّف حدود الشفاه بدقة ويمنع تسرب أحمر الشفاه.",
      ingredients: "شمع النحل، زيت الشيا، صبغات غنية.",
      usageInstructions: "حددي إطار الشفاه الخارجي، ويمكن استخدامه لتعبئة الشفاه بالكامل.",
      details: "دقة عالية • ينزلق بسلاسة • ثبات فائق.",
      isFeatured: false,
      isBestseller: true,
      isNew: false,
      sku: "LIP-LNR-01",
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { name: "Nude Rose", colorCode: "#C88A8A", price: 95.0, sku: "LIP-LNR-01-ROSE", quantity: 40, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80" },
        { name: "Deep Berry", colorCode: "#6B2D39", price: 95.0, sku: "LIP-LNR-01-BERRY", quantity: 25, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80" },
      ],
    },
  ];

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`Category slug not found: ${p.categorySlug}`);
      continue;
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        categoryId: categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        discountPercent: p.discountPercent,
        description: p.description,
        ingredients: p.ingredients,
        usageInstructions: p.usageInstructions,
        details: p.details,
        isFeatured: p.isFeatured,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        sku: p.sku,
        quantity: p.quantity ?? 0,
        status: ProductStatus.ACTIVE,
        isArchived: false,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            sortOrder: idx,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            name: v.name,
            colorCode: v.colorCode,
            price: v.price,
            sku: v.sku,
            quantity: v.quantity,
            imageUrl: v.imageUrl,
          })),
        },
      },
    });
    console.log(`  📦 Product created: ${createdProduct.name}`);
  }

  console.log("✅ Created demo products.");

  // 3. Populate HomepageContent, FeaturedCategory, InstagramImage, StoreSettings
  await prisma.homepageContent.create({
    data: {
      id: "main",
      heroTitle: "اكتشفي جمالكِ بطريقتك",
      heroSubtitle: "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى وثقة مطلقة في كل لحظة.",
      heroImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80",
      heroPrimaryLabel: "تسوقي المجموعة الفاخرة",
      heroPrimaryUrl: "/shop",
      heroSecondaryLabel: "اكتشفي الأكثر مبيعاً",
      heroSecondaryUrl: "/shop?filter=bestseller",
      promoText: "توصيل سريع لكافة المدن الفلسطينيّة • منتجات أصلية 100% • الدفع عند الاستلام فقط",
      promoActive: true,
      statementText: "نؤمن في FATEKIT بأن الجمال الفاخر هو احتفاء بالتميز والفخامة الشديدة. تم تصميم تشكيلاتنا الفائقة بدقة عالية لتناسب أرقى الأذواق.",
      statementImageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&auto=format&fit=crop&q=80",
      statementActive: true,
      instagramTitle: "تابعونا على إنستغرام @fatekit.beauty",
      instagramActive: true,
    },
  });

  const faceCatId = categoryMap.get("face");
  const eyesCatId = categoryMap.get("eyes");
  const lipsCatId = categoryMap.get("lips");
  const skinCatId = categoryMap.get("skincare");

  if (faceCatId && eyesCatId && lipsCatId && skinCatId) {
    await prisma.featuredCategory.createMany({
      data: [
        { categoryId: faceCatId, sortOrder: 1, imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80" },
        { categoryId: lipsCatId, sortOrder: 2, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80" },
        { categoryId: eyesCatId, sortOrder: 3, imageUrl: "https://images.unsplash.com/photo-1583241799080-311e63251c14?w=800&auto=format&fit=crop&q=80" },
        { categoryId: skinCatId, sortOrder: 4, imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80" },
      ],
    });
  }

  await prisma.instagramImage.createMany({
    data: [
      { imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80", sortOrder: 1 },
      { imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80", sortOrder: 2 },
      { imageUrl: "https://images.unsplash.com/photo-1583241799080-311e63251c14?w=600&auto=format&fit=crop&q=80", sortOrder: 3 },
      { imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80", sortOrder: 4 },
    ],
  });

  await prisma.storeSettings.create({
    data: {
      id: "main",
      storeName: "FATEKIT",
      logoUrl: "/logo.png",
      phone: "+970 599 000 000",
      email: "contact@fatekit.com",
      whatsapp: "+970599000000",
      deliveryAreas: ["القدس", "رام الله", "الخليل", "نابلس", "بيت لحم", "جنين", "طولكرم", "قلقيلية"],
      deliveryFee: 30.0,
      freeShippingMinimum: 350.0,
      currency: "ILS",
      codOnly: true,
    },
  });

  console.log("✅ Configured homepage content & store settings.");

  // 4. Admin User
  const passwordHash = bcrypt.hashSync("admin123", 10);

  const admin = await prisma.adminUser.create({
    data: {
      name: "مدير الفاتكيت",
      email: "admin@fatekit.com",
      passwordHash: passwordHash,
      role: AdminRole.OWNER,
    },
  });

  console.log(`✅ Created Admin user: ${admin.email} (Password: admin123)`);

  // 5. Sample Customers & Orders
  const customer1 = await prisma.customer.create({
    data: {
      name: "سارة أحمد",
      phone: "0599123456",
      email: "sara@example.com",
      ordersCount: 2,
      totalSpent: 450.0,
      lastOrderAt: new Date(),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "نورة العتيبي",
      phone: "0599654321",
      email: "noura@example.com",
      ordersCount: 1,
      totalSpent: 120.0,
      lastOrderAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  const firstProduct = await prisma.product.findFirst({
    where: { slug: "classic-matte-lipstick" },
    include: { variants: true },
  });

  if (firstProduct) {
    await prisma.order.create({
      data: {
        orderNumber: "ORD-9932",
        status: OrderStatus.NEW,
        customerId: customer1.id,
        shippingAddress: "شارع الإرسال، الماصيون",
        shippingCity: "رام الله",
        deliveryNotes: "الرجاء الاتصال قبل التوصيل بقليل",
        subtotal: 420.0,
        shippingFee: 30.0,
        discount: 0.0,
        total: 450.0,
        paymentMethod: "COD",
        items: {
          create: [
            {
              productId: firstProduct.id,
              variantId: firstProduct.variants[0]?.id,
              productNameSnapshot: firstProduct.name,
              variantNameSnapshot: firstProduct.variants[0]?.name,
              unitPrice: 150.0,
              quantity: 2,
              total: 300.0,
            },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        orderNumber: "ORD-9931",
        status: OrderStatus.PROCESSING,
        customerId: customer2.id,
        shippingAddress: "حي رفيديا، قرب المستشفى العربي",
        shippingCity: "نابلس",
        subtotal: 120.0,
        shippingFee: 0.0,
        discount: 0.0,
        total: 120.0,
        paymentMethod: "COD",
        items: {
          create: [
            {
              productId: firstProduct.id,
              productNameSnapshot: firstProduct.name,
              unitPrice: 120.0,
              quantity: 1,
              total: 120.0,
            },
          ],
        },
      },
    });
  }

  // Sample Coupon
  await prisma.coupon.create({
    data: {
      code: "FATE10",
      type: CouponType.PERCENTAGE,
      value: 10.0,
      minOrderAmount: 200.0,
      isActive: true,
      usageLimit: 100,
      usageCount: 5,
    },
  });

  console.log("✅ Created sample customers, orders, and coupons.");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
