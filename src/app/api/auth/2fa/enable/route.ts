import { NextRequest, NextResponse } from "next/server";
import { TOTP } from "otplib";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// تفعيل 2FA - التحقق من الكود وتفعيل الحماية
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // البحث عن إعدادات 2FA
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      return NextResponse.json(
        { error: "2FA not setup. Please setup 2FA first." },
        { status: 400 }
      );
    }

    // التحقق من الكود
    const totp = new TOTP({ secret: twoFactorAuth.secret });
    const isValid = totp.verify(code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // تفعيل 2FA
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      message: "2FA enabled successfully",
      backupCodes: twoFactorAuth.backupCodes,
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}