import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";
import { HydrationProvider } from "@/components/providers/hydration-provider";
import { StorageMigration } from "@/components/providers/storage-migration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://trademaster-omega.vercel.app"),
  title: {
    default: "TradeMaster | منصة إدارة التداول الشاملة",
    template: "%s | TradeMaster",
  },
  description: "منصة تداول متكاملة لإدارة المحافظ الاستثمارية والتداول الذكي مع أدوات متقدمة لإدارة المخاطر ويومية التداول وتحليل السيكولوجية",
  keywords: [
    "تداول", "محفظة استثمارية", "إدارة مخاطر", "فوركس", "أسهم",
    "trading", "portfolio management", "risk management", "forex", "stocks"
  ],
  authors: [{ name: "Mohamed Ali" }],
  creator: "Mohamed Ali",
  publisher: "TradeMaster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <StorageMigration />
            <HydrationProvider>
              {children}
            </HydrationProvider>
          </AuthProvider>
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
