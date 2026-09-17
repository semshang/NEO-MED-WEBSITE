import type { NextConfig } from "next";


const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://lh3.googleusercontent.com https://placehold.co https://neomeditech.com.np https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'neomeditech.com.np',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          ...(!isDevelopment ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
        ],
      },
      {
        source: "/(reset-password|api/auth/verify-email)",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  async redirects() {
    return [
      // Old URLs found in search results and checked against live replacements, 2026-09-15.
      ...[
        ["/product/oxygen-concentrator", "/products/oxygen-concentrator"],
        ["/product/ot-bed", "/products/ot-bed"],
        ["/product/tmt-machine", "/products/tmt-machine"],
        ["/product/radiant-warmer", "/products/radiant-warmer"],
        ["/product/bipap-circuit", "/products/bipap-circuit"],
        ["/faqs", "/faq"],
        ["/terms-of-use", "/terms-of-service"],
      ].flatMap(([source, destination]) => [
        { source, destination, permanent: true },
        { source: source + "/", destination, permanent: true },
      ]),
      // Confirmed historical WooCommerce URLs with verified destination products
      {
        source: "/product/inkjet-x-ray-blue-medical-film",
        destination: "/products/inkjet-x-ray-blue-medical-film",
        permanent: true,
      },
      {
        source: "/product/inkjet-x-ray-blue-medical-film/",
        destination: "/products/inkjet-x-ray-blue-medical-film",
        permanent: true,
      },
      {
        source: "/product/oxygen-sensor",
        destination: "/products/oxygen-sensor",
        permanent: true,
      },
      {
        source: "/product/oxygen-sensor/",
        destination: "/products/oxygen-sensor",
        permanent: true,
      },
      // Consolidate the public www hostname without affecting localhost or previews.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.neomeditech\\.com\\.np" }],
        destination: "https://neomeditech.com.np/:path*",
        permanent: true,
      },
      // Intentional catalogue index alias
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/products/",
        destination: "/shop",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
