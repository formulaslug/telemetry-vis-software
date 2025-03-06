import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: colors.neutral[950],
                "background-1": colors.neutral[950],
                "background-2": colors.neutral[900],
                "background-3": colors.neutral[800],
                foreground: colors.neutral[300],
                "foreground-1": colors.neutral[300],
                "foreground-2": colors.neutral[400],
                "foreground-3": colors.neutral[500],
                "foreground-gray": colors.neutral[700],
                catpuccin: {
                    red: "#e78284",
                    maroon: "#ea999c",
                    peach: "#ef9f76",
                    yellow: "#e5c890",
                    green: "#a6d189",
                    teal: "#81c8be",
                    sky: "#99d1db",
                    sapphire: "#85c1dc",
                    blue: "#8caaee",
                    lavender: "#babbf1",
                    text: "#c6d0f5",
                    "subtext-1": "#b5bfe2",
                    "subtext-0": "#a5adce",
                    crust: "#232634",
                    mantle: "#292c3c",
                    base: "#303446",
                    "surface-0": "#414559",
                    "surface-1": "#51576d",
                    "surface-2": "#626880",
                    "overlay-0": "#737994",
                    "overlay-1": "#838ba7",
                    "overlay-2": "#949cbb",
                },
            },
        },
    },
    plugins: [],
};
export default config;
