import type { NextConfig } from "next";

// Static Export: Die App braucht keinen Server, alle Daten bleiben im Browser.
const nextConfig: NextConfig = {
  output: "export",
  // Jede Seite als eigener Ordner mit index.html – funktioniert auf jedem einfachen Webserver.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
