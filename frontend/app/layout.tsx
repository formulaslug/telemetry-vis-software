import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import '@mantine/core/styles.css';
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from '@mantine/core';
const theme = createTheme({
  /** Put your mantine theme override here */
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className={`
        ${geistSans.variable} ${geistMono.variable} antialiased
        bg-background text-foreground
      `}>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
