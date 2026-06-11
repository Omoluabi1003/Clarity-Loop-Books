import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  turbopack: {
    rules: {
      "*.woff": {
        loaders: [{ loader: "./scripts/woff-data-loader.cjs" }],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
