"use client";

import { ColorHEX } from "@lightningchart/lcjs";
import { makeCustomTheme } from "@lightningchart/lcjs-themes";
import "../../../globals.css";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../../tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);

const colors = fullConfig.theme.colors as any;

const globalTheme = makeCustomTheme({
    isDark: true,
    gradients: false,
    effects: false,
    fontFamily: "Segoe UI, -apple-system, Verdana, Helvetica",
    backgroundColor: ColorHEX("#000000"),
    textColor: ColorHEX("#ffffffff"),
    dataColors: Object.values(colors.catpuccin).map((c) => ColorHEX(c as string)),
    axisColor: ColorHEX("#00000000"),
    gridLineColor: ColorHEX("#2e2e2eff"),
    uiBackgroundColor: ColorHEX("#020918ff"),
    uiBorderColor: ColorHEX("#ffffff"),
    dashboardSplitterColor: ColorHEX("#16173cff"),
});

export default globalTheme;
