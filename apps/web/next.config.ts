import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@eye1/common',
    '@eye1/db',
    '@eye1/connectors',
    '@eye1/ingestion',
    '@eye1/ai',
    '@eye1/agents',
    '@eye1/graph',
    '@eye1/queue',
  ],
};

export default nextConfig;
