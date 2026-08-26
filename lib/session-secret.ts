export const SESSION_COOKIE_NAME = "fatekit_admin_session";
const MINIMUM_SESSION_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "fallback_default_development_secret_that_is_32_characters_long";

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < MINIMUM_SESSION_SECRET_LENGTH) {
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}
