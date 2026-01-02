"use client";

import { ColorHEX } from "@lightningchart/lcjs";
import { makeCustomTheme } from "@lightningchart/lcjs-themes";
import "../../../globals.css";

const globalTheme = makeCustomTheme({
    isDark: true,
    gradients: false,
    effects: false,
    fontFamily: "Segoe UI, -apple-system, Verdana, Helvetica",
    backgroundColor: ColorHEX("#000000"),
    textColor: ColorHEX("#ffffffff"),
    // dataColors: Object.values(colors.catpuccin).map((c) => ColorHEX(c as string)),
    dataColors: [
        ColorHEX("#e78284"),
        // ColorHEX("#ea999c"),
        // ColorHEX("#ef9f76"),
        ColorHEX("#e5c890"),
        ColorHEX("#a6d189"),
        ColorHEX("#81c8be"),
        // ColorHEX("#99d1db"),
        // ColorHEX("#85c1dc"),
        ColorHEX("#8caaee"),
        ColorHEX("#babbf1"),
        // ColorHEX("#c6d0f5"),
    ],
    axisColor: ColorHEX("#00000000"),
    gridLineColor: ColorHEX("#2e2e2eff"),
    uiBackgroundColor: ColorHEX("#020918ff"),
    uiBorderColor: ColorHEX("#ffffff"),
    dashboardSplitterColor: ColorHEX("#16173cff"),
});

export default globalTheme;
