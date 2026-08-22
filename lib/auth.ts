import { AdminRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "fatekit_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const MINIMUM_SESSION_SECRET_LENGTH = 32;

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  exp: number;
}

function getSessionSecret(): string {
  if (!SESSION_SECRET || SESSION_SECRET.length < MINIMUM_SESSION_SECRET_LENGTH) {
    return "fallback_default_development_secret_that_is_32_characters_long";
  }

  return SESSION_SECRET;
}

// Simple & robust Web Crypto HMAC-SHA256 token encoding/decoding
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export async function signSessionToken(payload: Omit<AdminSessionPayload, "exp">): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
  const fullPayload: AdminSessionPayload = { ...payload, exp };
  
  const headerStr = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadStr = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${headerStr}.${payloadStr}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const signatureStr = Buffer.from(signatureBuffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${dataToSign}.${signatureStr}`;
}

export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerStr, payloadStr, signatureStr] = parts;
    const dataToSign = `${headerStr}.${payloadStr}`;

    const key = await getCryptoKey();
    
    // Convert signature from base64url to Buffer
    let base64Sig = signatureStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) base64Sig += "=";
    const sigBuffer = Buffer.from(base64Sig, "base64");

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      new TextEncoder().encode(dataToSign)
    );

    if (!isValid) return null;

    const payload: AdminSessionPayload = JSON.parse(base64UrlDecode(payloadStr));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch (error) {
    return null;
  }
}
