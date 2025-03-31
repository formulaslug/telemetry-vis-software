import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
    // Required for self hosting in a docker container
    output: "standalone",

    // Annoying UI popup that gets in the way 99% of the time
    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },

    // Required for parquet-wasm to work
    webpack: (config, _) => {
        config.experiments = {
            asyncWebAssembly: true,
            topLevelAwait: true,
            layers: true,
        };

        // https://lightningchart.com/js-charts/docs/more-guides/lc-resources/#example-webpack-config
        config.plugins.push(
            new CopyPlugin({
                patterns: [
                    {
                        from: "node_modules/@lightningchart/lcjs/dist/resources",
                        to: "resources",
                    },
                ],
            }),
        );
        return config;
    },
};

export default nextConfig;
