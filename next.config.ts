import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
