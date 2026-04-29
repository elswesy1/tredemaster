// lib/env-fallback.ts
// مفاتيح احتياطية لبيئة الإنتاج. هذا الملف لا يُحمّل إلا عند فشل تحميل المتغير من البيئة.

export function getRequiredEnv(key: string): string {
  const value = process.env[key] || fallbackValues[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const fallbackValues: Record<string, string> = {
  // ضع هنا المفاتيح المطلوبة فقط، كما تظهر في .env المحلي
  JWT_SECRET: '35a9b413a8c819d3de2c1a5dce577ab2f7a3dd555941c52f34792f58121bcc43',
  NEXTAUTH_SECRET: '0e52d20e981242296616653a3a0da5bf29242c4f9e79db40a6308628471794ce73fb34f5e6b5d9cbb6bf0c625ba2b3eee8085fede8b78c3a28419eac867462b0',
};
