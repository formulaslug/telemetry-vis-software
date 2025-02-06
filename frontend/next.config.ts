import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for self hosting in a docker container
  output: 'standalone',

  // Required for parquet-wasm to work
  webpack: (config, _) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
