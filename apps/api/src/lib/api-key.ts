import { createHash, randomBytes } from "crypto"

const API_KEY_PREFIX = "sl_"

/** Generate a fresh API key for a product. Returned ONLY at creation time. */
export function generateApiKey(): { raw: string; hash: string } {
  const random = randomBytes(24).toString("base64url") // 32-char URL-safe
  const raw = `${API_KEY_PREFIX}${random}`
  const hash = hashApiKey(raw)
  return { raw, hash }
}

/** Hash an API key for storage / lookup. */
export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

/** Check if a string looks like one of our API keys. */
export function isValidApiKeyFormat(key: string): boolean {
  return typeof key === "string" && key.startsWith(API_KEY_PREFIX) && key.length > 8
}
