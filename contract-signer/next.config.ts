import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbo: {
    resolveAlias: {
      canvas: "",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
