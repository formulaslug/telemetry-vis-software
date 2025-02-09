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
        "background": colors.neutral[950],
        "background-1": colors.neutral[950],
        "background-2": colors.neutral[900],
        "background-3": colors.neutral[800],
        "foreground": colors.neutral[300],
        "foreground-1": colors.neutral[300],
        "foreground-2": colors.neutral[400],
        "foreground-3": colors.neutral[500],
        "foreground-gray": colors.neutral[700],
      },
    },
  },
  plugins: [],
};
export default config;
