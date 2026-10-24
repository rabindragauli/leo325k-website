import type { NextConfig } from "next";

// Baseline security headers. Sprint 7 adds CSP and HSTS (docs/07_SECURITY_AND_PRIVACY.md).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // cPanel/Passenger runs .next/standalone/server.js via app.js
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Public DB content (src/server/queries/public.ts). Admin publishes refresh it at once with
  // revalidateTag (Sprint 5); the 15-minute revalidate is only a safety net.
  cacheLife: {
    publicContent: { stale: 300, revalidate: 900, expire: 86400 },
  },
  images: {
    formats: ["image/webp"],
    // Fallback if sharp cannot load on the server (MASTER_PROMPT §1, Images)
    unoptimized: process.env.IMAGES_UNOPTIMIZED === "true",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Old static-site URLs → clean URLs. Full list pending from Rabindra (docs/08).
  async redirects() {
    return [
      { source: "/leo.html", destination: "/leadership", statusCode: 301 },
      { source: "/index.html", destination: "/", statusCode: 301 },
    ];
  },
};

export default nextConfig;
