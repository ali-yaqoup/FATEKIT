export const SESSION_COOKIE_NAME = "fatekit_admin_session";
const MINIMUM_SESSION_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "fallback_default_development_secret_that_is_32_characters_long";

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= MINIMUM_SESSION_SECRET_LENGTH) {
    return secret;
  }
  // `next build` sets NODE_ENV=production. Skip the throw so missing
  // runtime secrets don't fail compile on Vercel.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters in production."
    );
  }
  return DEV_FALLBACK_SECRET;
}
