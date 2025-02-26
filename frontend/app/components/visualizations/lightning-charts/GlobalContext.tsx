// https://lightningchart.com/js-charts/docs/frameworks/react/#optimizing-apps-with-several-charts-visible-at-once--charts-being-initialized-often
// copy pasted from here:
// https://github.com/Arction/lcjs-react-template/blob/master/src/LC.tsx
"use client";
import React, { createContext, useEffect, useRef, useState, PropsWithChildren } from "react";
import { LightningChart, lightningChart } from "@lightningchart/lcjs";

export const LightningChartsContext = createContext<undefined | LightningChart>(undefined);

export function LightningChartsHost(props: PropsWithChildren) {
    const lcRef = useRef<undefined | LightningChart>(undefined);
    const [lcState, setLcState] = useState<undefined | LightningChart>(undefined);

    useEffect(() => {
        console.log("hi");
        // if (lcRef.current) return;
        // If license information from .env not available, bail early
        if (
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY ||
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE ||
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY
        ) {
            console.warn("No LightningChart license found!");
            return;
        }
        if (!lcRef.current) {
            try {
                lcRef.current = lightningChart({
                    license: process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY,
                    licenseInformation: {
                        appTitle:
                            process.env
                                .NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE,
                        company:
                            process.env
                                .NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY,
                    },

                    // Fixes bad Firefox performance:
                    // https://lightningchart.com/js-charts/docs/more-guides/optimizing-performance/#mozilla-firefox
                    sharedContextOptions: {
                        useIndividualCanvas: false,
                    },
                });
                setLcState(lcRef.current);
            } catch (e) {
                console.error(e);
            }
        }

        return () => {
            if (lcRef.current && "dispose" in lcRef.current) {
                lcRef.current.dispose();
                lcRef.current = undefined;
                setLcState(undefined);
            }
        };
    }, []);

    return (
        <LightningChartsContext.Provider value={lcState}>
            {props.children}
        </LightningChartsContext.Provider>
    );
}
