import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8001";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    proxyTimeout: 300_000, // 5 minutes for GPU backend (8K processing)
  },
  async rewrites() {
    return {
      // Route handlers (like /api/preview-stream) take priority over rewrites.
      // "afterFiles" rewrites only match if no file/route handler matched.
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
