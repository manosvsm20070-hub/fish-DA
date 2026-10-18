import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Allow local and dynamic API uploads
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
      {
        pathname: '/api/uploads/**',
      },
    ],
  },
};

export default nextConfig;
