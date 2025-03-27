// https://github.com/aidenybai/react-scan/blob/main/docs/installation/next-js-app-router.md#as-a-module-import

"use client";
// react-scan must be imported before react
import { scan } from "react-scan";
import { JSX, useEffect } from "react";

export function ReactScan(): JSX.Element {
  useEffect(() => {
    scan({
      enabled: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
    });
  }, []);

  return <></>;
}
