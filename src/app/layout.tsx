import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  description: "منصة تداول متكاملة لإدارة المحافظ الاستثمارية والتداول الذكي مع أدوات متقدمة لإدارة المخاطر ويومية التداول وتحليل السيكولوجية - Comprehensive trading platform for portfolio management, smart trading, risk management, trading journal, and psychological analysis",
  keywords: [
    // العربية
    "تداول",
    "محفظة استثمارية",
    "إدارة مخاطر",
    "فوركس",
    "أسهم",
    "يومية تداول",
    "سكالبنج",
    "داكس",
    "نازداك",
    "مؤشرات",
    "عملات رقمية",
    "عقود خيرية",
    "تحليل فني",
    "سيكولوجية التداول",
    // English
    "trading",
    "portfolio management",
    "risk management",
    "forex",
    "stocks",
    "trading journal",
    "scalping",
    "DAX",
    "NASDAQ",
    "indices",
    "cryptocurrency",
    "CFD",
    "technical analysis",
    "trading psychology",
  ],
  authors: [{ name: "Mohamed Ali", url: "https://trademaster-omega.vercel.app" }],
  creator: "Mohamed Ali",
  publisher: "TradeMaster",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    url: "https://trademaster-omega.vercel.app",
    siteName: "TradeMaster",
    title: "TradeMaster | منصة إدارة التداول الشاملة للعالم العربي",
    description: "منصة ذكية لإدارة محافظك الاستثمارية، تتبع صفقاتك، وتحليل أدائك السيكولوجي لتصبح متداول محترف",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TradeMaster - منصة إدارة التداول",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeMaster | منصة إدارة التداول الشاملة",
    description: "منصة ذكية لإدارة محافظك الاستثمارية وتتبع صفقاتك وتحليل أدائك",
    images: ["/og-image.png"],
    creator: "@trademaster",
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://trademaster-omega.vercel.app",
    languages: {
      "ar-EG": "https://trademaster-omega.vercel.app/?lang=ar",
      "en-US": "https://trademaster-omega.vercel.app/?lang=en",
    },
  },
  category: "finance",
  classification: "Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Icons & Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TradeMaster" />
        <meta name="application-name" content="TradeMaster" />
        <meta name="msapplication-TileColor" content="#eab308" />
        <meta name="theme-color" content="#eab308" />
        <meta name="msapplication-navbutton-color" content="#eab308" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
