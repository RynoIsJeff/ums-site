import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // If Turbopack keeps failing, uncomment this to force Webpack:
  // experimental: { turbo: { enabled: false } },
};

export default nextConfig;
