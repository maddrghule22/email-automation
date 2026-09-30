import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/operations/exceptions", destination: "/exceptions" },
      { source: "/operations/exceptions/:id*", destination: "/exceptions/:id*" },
      { source: "/workflows/new", destination: "/workflows-new" },
    ];
  },
};

export default nextConfig;
