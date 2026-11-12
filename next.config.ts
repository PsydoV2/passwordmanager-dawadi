import type { NextConfig } from "next";

// Static Export: Die App braucht keinen Server, alle Daten bleiben im Browser.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
