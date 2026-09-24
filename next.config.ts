import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cloudflare Pages via @cloudflare/next-on-pages */
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
