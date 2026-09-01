import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // In a monorepo, Turbopack needs to access the hoisted root node_modules
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
