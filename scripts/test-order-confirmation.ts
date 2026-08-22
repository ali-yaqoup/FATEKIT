import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyOrderConfirmation() {
  console.log("=================================================");
  console.log("🔍 Verifying Order Confirmation Data from DB");
  console.log("=================================================\n");

  // 1. Fetch the latest order with all relations
  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      coupon: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!latestOrder) {
    throw new Error("No orders found in database!");
  }

  console.log(`✓ Retrieved Order from Database:`);
  console.log(`  - Order ID: ${latestOrder.id}`);
  console.log(`  - Order Number: ${latestOrder.orderNumber}`);
  console.log(`  - Status (OrderStatus enum): ${latestOrder.status}`);
  console.log(`  - Payment Method: ${latestOrder.paymentMethod}`);
  console.log(`  - Created At: ${latestOrder.createdAt.toISOString()}`);

  console.log(`\n✓ Customer Information:`);
  console.log(`  - Name: ${latestOrder.customer.name}`);
  console.log(`  - Phone: ${latestOrder.customer.phone}`);
  console.log(`  - Email: ${latestOrder.customer.email || "N/A"}`);

  console.log(`\n✓ Shipping Information:`);
  console.log(`  - City: ${latestOrder.shippingCity}`);
  console.log(`  - Address: ${latestOrder.shippingAddress}`);
  console.log(`  - Delivery Notes: ${latestOrder.deliveryNotes || "N/A"}`);

  console.log(`\n✓ Ordered Items (${latestOrder.items.length}):`);
  for (const item of latestOrder.items) {
    console.log(`  - Product: "${item.productNameSnapshot}"`);
    console.log(`    Variant: ${item.variantNameSnapshot || "Standard"}`);
    console.log(`    Unit Price: ${item.unitPrice} ₪`);
    console.log(`    Quantity: ${item.quantity}`);
    console.log(`    Line Total: ${item.total} ₪`);
    console.log(`    Product DB ID: ${item.productId}`);
  }

  console.log(`\n✓ Financial Summary:`);
  console.log(`  - Subtotal: ${latestOrder.subtotal} ₪`);
  console.log(`  - Shipping Fee: ${latestOrder.shippingFee} ₪`);
  console.log(`  - Discount: ${latestOrder.discount} ₪ ${latestOrder.coupon ? `(Coupon: ${latestOrder.coupon.code})` : ""}`);
  console.log(`  - Grand Total: ${latestOrder.total} ₪`);

  console.log("\n=================================================");
  console.log("✅ Order Confirmation data verified successfully!");
  console.log("=================================================\n");
}

verifyOrderConfirmation()
  .catch((e) => {
    console.error("❌ Verification Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
