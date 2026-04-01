import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    proxyTimeout: 120_000, // 2 minutes for backend proxy (v20 processing)
  },
  async rewrites() {
    return {
      // Route handlers (like /api/preview-stream) take priority over rewrites.
      // "afterFiles" rewrites only match if no file/route handler matched.
      afterFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:8001/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
