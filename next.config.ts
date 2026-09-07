import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* a stray package-lock.json sits in the parent directory; pin the root
   * so Turbopack infers this app, not the folder above it */
  turbopack: { root: __dirname },
  /* the floating dev badge sits on top of the task rows on a phone */
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
