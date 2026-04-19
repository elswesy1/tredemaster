import { NextRequest, NextResponse } from "next/server";
import { TOTP, generateSecret } from "otplib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// إعداد 2FA - إنشاء سر جديد وQR Code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // إنشاء سر جديد
    const secret = generateSecret();
    
    // إنشاء URI للـ QR Code
    const serviceName = "TradeMaster";
    const otpauth = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}&algorithm=SHA1&digits=6&period=30`;
    
    // إنشاء QR Code كـ base64
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // حفظ السر مؤقتاً (لم يتم التفعيل بعد)
    await prisma.twoFactorAuth.upsert({
      where: { userId },
      create: {
        userId,
        secret,
        enabled: false,
        backupCodes: generateBackupCodes(),
      },
      update: {
        secret,
        backupCodes: generateBackupCodes(),
      },
    });

    return NextResponse.json({
      secret,
      qrCodeUrl,
      message: "2FA setup initiated. Scan the QR code with your authenticator app.",
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

// توليد أكواد النسخ الاحتياطي
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}