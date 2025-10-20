import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Silence workspace root warning
  outputFileTracingRoot: undefined,
};

export default nextConfig;
