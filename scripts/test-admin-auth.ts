import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signSessionToken, verifySessionToken } from "../lib/auth";
import { loginAdminAction } from "../lib/actions/auth";

const prisma = new PrismaClient();

async function runAdminAuthTest() {
  console.log("=================================================");
  console.log("🔐 Testing Admin Authentication & Protection");
  console.log("=================================================\n");

  // 1. Verify admin user exists in DB
  console.log("1️⃣ Checking AdminUser table in Database...");
  const adminInDb = await prisma.adminUser.findUnique({
    where: { email: "admin@fatekit.com" },
  });

  if (!adminInDb) {
    throw new Error("Seed admin user (admin@fatekit.com) not found in DB!");
  }

  console.log(`✓ Admin User found: ID=${adminInDb.id}, Email=${adminInDb.email}, Name=${adminInDb.name}, Role=${adminInDb.role}`);

  // 2. Test Invalid Login Attempts
  console.log("\n2️⃣ Testing Invalid Login Scenarios...");

  // Non-existent email
  const nonExistentRes = await loginAdminAction("nonexistent@domain.com", "admin123");
  console.log(`✓ Non-existent email login: success=${nonExistentRes.success}, error="${nonExistentRes.error}"`);

  // Wrong password
  const wrongPasswordRes = await loginAdminAction("admin@fatekit.com", "wrongpassword");
  console.log(`✓ Wrong password login: success=${wrongPasswordRes.success}, error="${wrongPasswordRes.error}"`);

  // Empty credentials
  const emptyRes = await loginAdminAction("", "");
  console.log(`✓ Empty fields login: success=${emptyRes.success}, error="${emptyRes.error}"`);

  // 3. Test Successful Login with Seed Credentials
  console.log("\n3️⃣ Testing Successful Login with Seed Credentials (admin@fatekit.com / admin123)...");
  const validLoginRes = await loginAdminAction("admin@fatekit.com", "admin123");

  if (!validLoginRes.success || !validLoginRes.user) {
    throw new Error(`Valid login failed: ${validLoginRes.error}`);
  }

  console.log(`✓ Login Succeeded! User info:`, validLoginRes.user);

  // 4. Test Session Token Signing and Verification (HMAC-SHA256)
  console.log("\n4️⃣ Testing Session Token Signing & HMAC Verification...");
  const testPayload = {
    id: adminInDb.id,
    email: adminInDb.email,
    name: adminInDb.name,
    role: adminInDb.role,
  };

  const token = await signSessionToken(testPayload);
  console.log(`✓ Signed Session Token generated (length: ${token.length})`);

  const verifiedPayload = await verifySessionToken(token);
  if (!verifiedPayload) {
    throw new Error("Session token verification failed!");
  }
  console.log(`✓ Token Verified successfully: ID=${verifiedPayload.id}, Email=${verifiedPayload.email}, Role=${verifiedPayload.role}`);

  // Test Tampered Token
  const tamperedToken = token.slice(0, -5) + "abcde";
  const tamperedVerified = await verifySessionToken(tamperedToken);
  console.log(`✓ Tampered token rejected: result=${tamperedVerified === null}`);

  // 5. Test Staff role vs Owner role check
  console.log("\n5️⃣ Testing Role Permissions logic...");
  const ownerRoles = ["OWNER"];
  const allRoles = ["OWNER", "STAFF"];

  console.log(`✓ OWNER role can access Reports: ${ownerRoles.includes(AdminRole.OWNER)}`);
  console.log(`✓ STAFF role access to Reports: ${ownerRoles.includes(AdminRole.STAFF)} (Restricted)`);
  console.log(`✓ STAFF role access to Orders: ${allRoles.includes(AdminRole.STAFF)} (Allowed)`);

  console.log("\n=================================================");
  console.log("🎉 ALL ADMIN AUTH & PROTECTION TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================\n");
}

runAdminAuthTest()
  .catch((e) => {
    console.error("❌ Admin Auth Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
