import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from "crypto";
import { env } from "process";

// مفتاح التشفير من متغيرات البيئة - إلزامي
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is required for security");
}
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// اشتقاق مفتاح التشفير
function deriveKey(key: string): Buffer {
  return scryptSync(key, "salt", 32);
}

/**
 * تشفير النص الحساس
 * @param text - النص المراد تشفيره
 * @returns النص المشفر بصيغة base64
 */
export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(ENCRYPTION_KEY);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  
  const authTag = cipher.getAuthTag();
  
  // دمج IV + AuthTag + Encrypted Data
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, "base64")]);
  
  return combined.toString("base64");
}

/**
 * فك تشفير النص
 * @param encryptedData - النص المشفر
 * @returns النص الأصلي
 */
export function decrypt(encryptedData: string): string {
  const combined = Buffer.from(encryptedData, "base64");
  
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  
  const key = deriveKey(ENCRYPTION_KEY);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * تشفير API Key
 * @param apiKey - مفتاح API
 * @returns البيانات المشفرة
 */
export function encryptApiKey(apiKey: string): { encrypted: string; hash: string } {
  const encrypted = encrypt(apiKey);
  const hash = createHash(apiKey);
  
  return { encrypted, hash };
}

/**
 * إنشاء hash للتحقق
 * @param data - البيانات
 * @returns hash
 */
export function createHash(data: string): string {
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}

/**
 * تشفير كائن JSON
 * @param obj - الكائن
 * @returns النص المشفر
 */
export function encryptObject(obj: object): string {
  const json = JSON.stringify(obj);
  return encrypt(json);
}

/**
 * فك تشفير كائن JSON
 * @param encryptedData - النص المشفر
 * @returns الكائن الأصلي
 */
export function decryptObject<T>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json) as T;
}

/**
 * توليد مفتاح تشفير عشوائي
 * @returns مفتاح 32 حرف
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("base64");
}

/**
 * إخفاء API Key للعرض
 * @param apiKey - مفتاح API
 * @returns المفتاح مخفياً جزئياً
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return "****";
  }
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}${"*".repeat(apiKey.length - 8)}${end}`;
}

/**
 * تشفير بيانات API للوسطاء
 * @param apiKey - مفتاح API
 * @param apiSecret - السر
 * @returns البيانات المشفرة
 */
export function encryptApiCredentials(apiKey: string, apiSecret: string): {
  encryptedApiKey: string;
  encryptedApiSecret: string;
  apiKeyHash: string;
} {
  return {
    encryptedApiKey: encrypt(apiKey),
    encryptedApiSecret: encrypt(apiSecret),
    apiKeyHash: createHash(apiKey),
  };
}
