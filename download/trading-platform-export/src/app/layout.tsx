import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "منصة التداول | Trading Platform",
  description: "منصة تداول متكاملة لإدارة المحافظ الاستثمارية والتداول الذكي مع أدوات متقدمة لإدارة المخاطر ويومية التداول - Comprehensive trading platform for portfolio management and smart trading with advanced risk management tools",
  keywords: ["تداول", "محفظة استثمارية", "إدارة مخاطر", "فوركس", "أسهم", "يومية تداول", "trading", "portfolio", "risk management", "forex", "stocks", "journal"],
  authors: [{ name: "Trading Platform Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
