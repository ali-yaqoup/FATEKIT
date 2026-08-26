import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, getSessionSecret } from "@/lib/session-secret";

async function isValidToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerStr, payloadStr, signatureStr] = parts;
    const dataToSign = `${headerStr}.${payloadStr}`;
    const secret = getSessionSecret();

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let base64Sig = signatureStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) base64Sig += "=";
    const sigBuffer = Uint8Array.from(atob(base64Sig), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      enc.encode(dataToSign)
    );

    if (!isValid) return false;

    let base64Payload = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Payload.length % 4) base64Payload += "=";
    const payload = JSON.parse(atob(base64Payload));

    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await isValidToken(token) : false;

  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
