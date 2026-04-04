import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
