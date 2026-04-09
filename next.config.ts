import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'recharts',
      'react-syntax-highlighter',
      'ai',
      '@ai-sdk/react',
    ],
  },
};

export default nextConfig;
