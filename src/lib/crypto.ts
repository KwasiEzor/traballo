/**
 * src/lib/crypto.ts
 * Symmetric encryption for secrets stored at rest (e.g. the platform Anthropic
 * key in `app_settings`). AES-256-GCM; the key is derived from
 * BETTER_AUTH_SECRET so no extra env var is needed.
 *
 * Format: base64(salt[16] | iv[12] | authTag[16] | ciphertext)
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

function deriveKey(salt: Buffer): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for encryption.");
  return scryptSync(secret, salt, 32);
}

export function encryptSecret(plain: string): string {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, authTag, ciphertext]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const salt = buf.subarray(0, 16);
  const iv = buf.subarray(16, 28);
  const authTag = buf.subarray(28, 44);
  const ciphertext = buf.subarray(44);
  const key = deriveKey(salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/** Masked preview for display in the admin UI — never the full value. */
export function maskSecret(plain: string): string {
  const tail = plain.slice(-4);
  return `••••••••${tail}`;
}
