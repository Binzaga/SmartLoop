import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to be reached via the public IP when behind nginx.
  // Add real domain(s) here once you have HTTPS / DNS set up.
  allowedDevOrigins: ["47.82.1.197", "smartloop.local"],
};

export default nextConfig;
