import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env is optional when the variables are already in the environment
  }
}

loadEnv();

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "مدير المتجر";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      name,
      email,
      passwordHash,
      role: AdminRole.OWNER,
    },
  });

  console.log(`Admin password updated for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
