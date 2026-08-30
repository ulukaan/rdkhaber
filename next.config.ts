import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.googleadservices.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "toktasoft.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "static.hurriyet.com.tr",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "duzceradikal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.duzceradikal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "darkslategrey-kudu-152481.hostingersite.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.hostingersite.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/bolge-haberleri", destination: "/bolge-kategorileri", permanent: true },
      { source: "/bolge-haberleri/:path*", destination: "/bolge-kategorileri/:path*", permanent: true },
      { source: "/siyaset-partiler", destination: "/siyasi-partiler", permanent: true },
      { source: "/siyaset-partiler/:path*", destination: "/siyasi-partiler/:path*", permanent: true },
      { source: "/gizlilik", destination: "/sayfa/gizlilik", permanent: true },
      { source: "/kvkk", destination: "/sayfa/kvkk", permanent: true },
      { source: "/kullanim-kosullari", destination: "/sayfa/kullanim-kosullari", permanent: true },
    ];
  },
};

export default nextConfig;
