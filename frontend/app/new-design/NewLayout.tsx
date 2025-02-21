"use client";

import {
    ColorSchemeScript,
    createTheme,
    mantineHtmlProps,
    MantineProvider,
} from "@mantine/core";

const theme = createTheme({
    colors: {
        neutral: [
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

export default function NewLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript forceColorScheme="dark" />
            </head>
            <body className={`antialiased`}>
                <MantineProvider forceColorScheme="dark" theme={theme}>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
