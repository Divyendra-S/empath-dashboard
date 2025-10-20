import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix for macOS network interface error
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Use localhost explicitly to avoid network detection issues
  assetPrefix: undefined,
};

export default nextConfig;
