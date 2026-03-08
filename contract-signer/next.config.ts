import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
  webpack: (config) => {
    // Needed for react-pdf to work in Next.js (avoids canvas module error)
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
};

export default nextConfig;
