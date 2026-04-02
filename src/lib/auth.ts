import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import { TOTP } from "otplib";
import type { NextAuthConfig } from "next-auth";

// تكوين NextAuth
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/welcome",
  },
  providers: [
    // تسجيل الدخول بـ Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    
    // تسجيل الدخول بـ GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Magic Link - الدخول بدون كلمة مرور
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@trademaster.com",
      maxAge: 24 * 60 * 60, // 24 ساعة
    }),
    
    // تسجيل الدخول ببريد وكلمة مرور
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const twoFactorCode = credentials.twoFactorCode as string | undefined;

        // البحث عن المستخدم
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            twoFactorAuth: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // التحقق من كلمة المرور
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        // التحقق من 2FA إذا كان مفعلاً
        if (user.twoFactorAuth?.enabled) {
          if (!twoFactorCode) {
            throw new Error("2FA_REQUIRED");
          }

          const totp = new TOTP();
          const isValid = totp.verify({
            token: twoFactorCode,
            secret: user.twoFactorAuth.secret,
          });

          if (!isValid) {
            throw new Error("INVALID_2FA_CODE");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // السماح بتسجيل الدخول
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      // تحديث آخر تسجيل دخول
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// التحقق من جلسة المستخدم
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// التحقق من صلاحيات المستخدم
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// التحقق من صلاحية Admin
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
