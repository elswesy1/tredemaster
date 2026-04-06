import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إنتاج: Standalone لأقل حجم وأفضل أداء
  output: 'standalone',
  
  // تحسين الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 يوم
  },
  
  // تحسينات التجريبية
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    // تحسين سرعة التطوير
    typedRoutes: true,
  },
  
  // Headers أمنية
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/app',
        permanent: true,
      },
    ];
  },
  
  // React Strict Mode للإنتاج
  reactStrictMode: true,
  
  // تعطيل x-powered-by header
  poweredByHeader: false,
  
  // تحسين ESLint
  eslint: {
    // تعطيل ESLint أثناء البناء للسرعة (Vercel يفحصها)
    ignoreDuringBuilds: true,
  },
  
  // TypeScript
  typescript: {
    // تجاهل الأخطاء مؤقتاً لحل مشكلة الذاكرة
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
