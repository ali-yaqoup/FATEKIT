"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signSessionToken, verifySessionToken, AdminSessionPayload } from "@/lib/auth";
import { AdminRole } from "@prisma/client";

const SESSION_COOKIE_NAME = "fatekit_admin_session";

export async function loginAdminAction(emailInput: string, passwordInput: string) {
  try {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      return { success: false, error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور." };
    }

    const admin = await db.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }

    const token = await signSessionToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });
    } catch {
      // CLI/test fallback
    }

    return {
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً." };
  }
}

export async function logoutAdminAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // ignore
  }
  return { success: true };
}

export async function getAdminSessionAction(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Resolve the user on every protected request so role changes take effect
    // immediately and deleted users lose access.
    const admin = await db.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin || admin.email !== payload.email) return null;

    return {
      ...admin,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/** Server-side authorization guard for role-restricted admin pages. */
export async function requireAdminRole(
  allowedRoles: AdminRole[]
): Promise<AdminSessionPayload> {
  const session = await getAdminSessionAction();

  if (!session) {
    redirect("/admin/login");
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/admin");
  }

  return session;
}
