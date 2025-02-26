import type { Metadata } from "next";
// import localFont from "next/font/local";

import "./globals.css"; // Imports tailwind styles

import "@mantine/core/styles.css";
import {
    ColorSchemeScript,
    createTheme,
    mantineHtmlProps,
    MantineProvider,
} from "@mantine/core";
const theme = createTheme({
    defaultRadius: "md",

    colors: {
        neutral: [
            // // Manually converted from Tailwind `neutral-[100-950]`
            // "oklch(0.97 0 0)", //--color-neutral-100:  #f5f5f5
            // "oklch(0.922 0 0)", //--color-neutral-200:  #e5e5e5
            // "oklch(0.87 0 0)", //--color-neutral-300:  #d4d4d4
            // "oklch(0.708 0 0)", //--color-neutral-400:  #a1a1a1
            // "oklch(0.556 0 0)", //--color-neutral-500:  #737373
            // "oklch(0.439 0 0)", //--color-neutral-600:  #525252
            // "oklch(0.371 0 0)", //--color-neutral-700:  #404040
            // "oklch(0.269 0 0)", //--color-neutral-800:  #262626
            // "oklch(0.205 0 0)", //--color-neutral-900:  #171717
            // "oklch(0.145 0 0)", //--color-neutral-950:  #0a0a0a

            // Better version of "neutral", generated using
            // Mantine's color generator
            "#f5f5f5",
            "#e7e7e7",
            "#cdcdcd",
            "#b2b2b2",
            "#9a9a9a",
            "#8b8b8b",
            "#848484",
            "#717171",
            "#656565",
            "#575757",
        ],
        primary: [
            "#e4f8ff",
            "#d3ebfb",
            "#aad4ef",
            "#7ebce4",
            "#5aa7db",
            "#429ad5",
            "#3294d4",
            "#2080bc",
            "#0e72aa",
            "#006397",
        ],
        secondary: [
            "#fefee2",
            "#fcfbce",
            "#f9f7a0",
            "#f6f36d",
            "#f3ef43",
            "#f2ec29",
            "#f1eb17",
            "#d6d106",
            "#beb900",
            "#a3a000",
        ],
    },
    primaryColor: "neutral",
});

import { Inter } from "next/font/google";
const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

// this gets used automatically by NextJS
export const metadata: Metadata = {
    title: "FS-3 Live Visualization",
    description: "Created by the Formula Slug Telemetry Team",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript forceColorScheme="dark" />
            </head>
            <body className={`${inter.className} antialiased bg-background text-foreground`}>
                <MantineProvider forceColorScheme="dark" theme={theme}>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
