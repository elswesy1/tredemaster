import { NextRequest, NextResponse } from "next/server";
import { TOTP } from "otplib";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// تعطيل 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, password } = body;

    if (!code && !password) {
      return NextResponse.json(
        { error: "Verification code or password is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // البحث عن إعدادات 2FA
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    // التحقق من الكود
    if (code) {
      const totp = new TOTP({ secret: twoFactorAuth.secret });
      const isValid = totp.verify(code);
      
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }
    }

    // تعطيل 2FA
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { enabled: false },
    });

    return NextResponse.json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}