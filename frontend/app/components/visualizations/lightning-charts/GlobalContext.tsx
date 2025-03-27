// https://lightningchart.com/js-charts/docs/frameworks/react/#optimizing-apps-with-several-charts-visible-at-once--charts-being-initialized-often
// copy pasted from here:
// https://github.com/Arction/lcjs-react-template/blob/master/src/LC.tsx
"use client";
import React, {
    createContext,
    useEffect,
    useRef,
    useState,
    PropsWithChildren,
    useCallback,
    useContext,
} from "react";
import {
    Axis,
    LightningChart,
    lightningChart,
    synchronizeAxisIntervals,
    SynchronizeAxisIntervalsHandle,
} from "@lightningchart/lcjs";

export const LightningChartsContext = createContext<LightningChart | null>(null);

export function LightningChartsProvider(props: PropsWithChildren) {
    const lcRef = useRef<LightningChart | null>(null);

    const [lcState, setLcState] = useState<LightningChart | null>(null);
    // todo: add something to the state here to enable auto-synchronization of
    // newly created chart axis. (maybe try just removing 2/3 first? also
    // stacked axis in one chart?)

    useEffect(() => {
        if (lcRef.current) return;

        // If license information from .env not available, bail early
        if (
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY ||
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE ||
            !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY
        ) {
            console.warn("No LightningChart license found!");
            return;
        }

        try {
            lcRef.current = lightningChart({
                license: process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY,
                licenseInformation: {
                    appTitle:
                        process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE,
                    company:
                        process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY,
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

        return () => {
            if (lcRef.current && "dispose" in lcRef.current) {
                lcRef.current.dispose();
                lcRef.current = null;
                setLcState(null);
            }
        };
    }, []);

    return (
        <LightningChartsContext.Provider value={lcState}>
            {props.children}
        </LightningChartsContext.Provider>
    );
}

// // https://lightningchart.com/js-charts/docs/frameworks/react/#optimizing-apps-with-several-charts-visible-at-once--charts-being-initialized-often
// // copy pasted from here:
// // https://github.com/Arction/lcjs-react-template/blob/master/src/LC.tsx
// "use client";
// import React, {
//     createContext,
//     useEffect,
//     useRef,
//     useState,
//     PropsWithChildren,
//     useCallback,
//     useContext,
// } from "react";
// import {
//     Axis,
//     LightningChart,
//     lightningChart,
//     synchronizeAxisIntervals,
//     SynchronizeAxisIntervalsHandle,
// } from "@lightningchart/lcjs";
//
// type LCContextObject = {
//     lightningChart: LightningChart | null;
//     synchronizeAxis: (axis: Axis) => void;
// };
//
// export const LightningChartsContext = createContext<LCContextObject | null>(null);
//
// export function LightningChartsProvider(props: PropsWithChildren) {
//     const lcRef = useRef<LightningChart | null>(null);
//     const syncHandleRef = useRef<SynchronizeAxisIntervalsHandle>();
//     const axisListRef = useRef<Axis[]>([]);
//
//     const synchronizeAxis = useCallback((axis: Axis) => {
//         console.log(axis.getTitle());
//
//         // if (syncHandleRef.current) syncHandleRef.current.remove();
//         axisListRef.current.push(axis);
//         if (axisListRef.current.length > 1) {
//             console.log(axisListRef.current);
//
//             syncHandleRef.current = synchronizeAxisIntervals(...axisListRef.current);
//         }
//
//         return () => axisListRef.current.splice(axisListRef.current.indexOf(axis));
//     }, []);
//
//     const [lcState, setLcState] = useState<LCContextObject>({
//         lightningChart: null,
//         synchronizeAxis,
//     });
//     // todo: add something to the state here to enable auto-synchronization of
//     // newly created chart axis. (maybe try just removing 2/3 first? also
//     // stacked axis in one chart?)
//
//     useEffect(() => {
//         if (lcRef.current) return;
//
//         // If license information from .env not available, bail early
//         if (
//             !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY ||
//             !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE ||
//             !process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY
//         ) {
//             console.warn("No LightningChart license found!");
//             return;
//         }
//
//         try {
//             lcRef.current = lightningChart({
//                 license: process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY,
//                 licenseInformation: {
//                     appTitle:
//                         process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE,
//                     company:
//                         process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY,
//                 },
//
//                 // Fixes bad Firefox performance:
//                 // https://lightningchart.com/js-charts/docs/more-guides/optimizing-performance/#mozilla-firefox
//                 sharedContextOptions: {
//                     useIndividualCanvas: false,
//                 },
//             });
//             setLcState({ lightningChart: lcRef.current, synchronizeAxis });
//         } catch (e) {
//             console.error(e);
//         }
//
//         return () => {
//             if (lcRef.current && "dispose" in lcRef.current) {
//                 lcRef.current.dispose();
//                 lcRef.current = null;
//                 setLcState({ lightningChart: null, synchronizeAxis });
//             }
//         };
//     }, []);
//
//     return (
//         <LightningChartsContext.Provider value={lcState}>
//             {props.children}
//         </LightningChartsContext.Provider>
//     );
// }
//
// export function useLightningChartsContext() {
//     const lcObj = useContext(LightningChartsContext);
//     if (!lcObj)
//         console.warn(
//             "useLightningChartsContext() can only be called from within a LightningChartsProvider!",
//         );
//     return lcObj as LCContextObject;
// }
