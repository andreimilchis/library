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
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
