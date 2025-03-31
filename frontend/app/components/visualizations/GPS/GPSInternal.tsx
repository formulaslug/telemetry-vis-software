import React, { useContext, useEffect, useId, useMemo, useRef } from "react";
import {
    emptyFill,
    SolveResultSampleXY,
    CursorTargetChangedEvent,
    AxisTickStrategies,
    SolidLine,
    SolidFill,
    ColorHEX,
    ColorRGBA,
    PalettedFill,
    LUT,
    transparentFill,
    emptyLine,
    ChartXY,
    PointLineAreaSeries,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "../lightning-charts/GlobalContext";
import globalTheme from "../lightning-charts/GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { MAX_DATA_ROWS, timeColumnName } from "@/app/data-processing/datatypes";

import dynamic from "next/dynamic";
const Leaflet = dynamic(() => import("./Leaflet").then((o) => o), { ssr: false });

// IMPORTANT: in Leaflet, LAT is vertical (y) and LNG is horizontal (x)
const LAT_COLNAME = "VDM_GPS_Latitude"; // "GPSi_Latitude";
const LNG_COLNAME = "VDM_GPS_Longitude"; // "GPSi_Longitude";

const defaultBgSeriesStrokeStyle = new SolidLine({
    // this is just the default; its set again below
    thickness: 25,
    fillStyle: new SolidFill({ color: ColorHEX("#808080") }),
});

interface GPSInternalProps {
    useLeaflet: boolean;
    useBgSeries: boolean;
    trackThickness: number;
    carLineThickness: number;
}
export default function GPSInternal({
    useLeaflet,
    useBgSeries,
    trackThickness,
    carLineThickness,
}: GPSInternalProps) {
    const {
        subscribeViewInterval,
        subscribeLatestArrays,
        subscribeReset,
        setCursor,
        dataArraysRef,
        viewableArraysRef,
    } = useDataMethods();
    const id = useId();
    const containerRef = useRef(null);
    const lc = useContext(LightningChartsContext);
    const chartRef = useRef<ChartXY>(null);

    // referenced in multiple places bellow. Only for avoiding frequent allocation
    const allZeroArray = useMemo(() => new Float32Array(MAX_DATA_ROWS).fill(0), []);
    const allOneArray = useMemo(() => new Float32Array(MAX_DATA_ROWS).fill(1), []);

    const bgSeriesRef = useRef<PointLineAreaSeries | null>(null);
    const visibleSeriesRef = useRef<PointLineAreaSeries | null>(null);

    // Based on https://lightningchart.com/js-charts/docs/features/xy/freeform-line/
    useEffect(() => {
        // !dataArraysRef.current[LAT_COLNAME] ||
        // !dataArraysRef.current[LONG_COLNAME]
        if (!containerRef.current || !lc) return;

        let chart = lc
            .ChartXY({
                container: containerRef.current,
                theme: globalTheme,
                // highPrecision is necessary for latitude/longitude with high zoom
                defaultAxisX: { type: "linear-highPrecision" },
                defaultAxisY: { type: "linear-highPrecision" },
            })
            // afaik you can't easily share pointer events between two overlapping divs
            .setCursorMode(useLeaflet ? undefined : "show-pointed")
            .setPadding(0)
            .setSeriesBackgroundFillStyle(transparentFill)
            .setSeriesBackgroundStrokeStyle(emptyLine);
        chartRef.current = chart;

        chart.engine.setBackgroundFillStyle(transparentFill);

        let visibleSeries = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                dataStorage: Float32Array,
                lookupValues: true,
                // todo: enable an LUT for color based on lap #???
            })
            .setDrawOrder({ seriesDrawOrderIndex: 2 })
            .setSamples({
                xValues: viewableArraysRef.current[LNG_COLNAME]!,
                yValues: viewableArraysRef.current[LAT_COLNAME]!,
                lookupValues: allOneArray.subarray(
                    0,
                    viewableArraysRef.current[timeColumnName]?.length ?? 0 + 1,
                ),
            })
            .setAreaFillStyle(emptyFill)
            .setPointFillStyle(emptyFill)
            // .setPointSize(0)
            .setStrokeStyle(
                new SolidLine({
                    thickness: carLineThickness,
                    fillStyle: new PalettedFill({
                        lookUpProperty: "value",
                        lut: new LUT({
                            interpolate: true,
                            steps: [
                                { value: 0, color: ColorRGBA(0, 0, 0, 0) },
                                { value: 1, color: ColorRGBA(0, 255, 0) },
                            ],
                        }),
                    }),
                }),
            )
            // splines aren't supported for freeform (non-progressive) data :/
            // .setCurvePreprocessing({ type: "spline" });
        visibleSeriesRef.current = visibleSeries;

        let bgSeries = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                dataStorage: Float32Array,
            })
            .setDrawOrder({ seriesDrawOrderIndex: 1 })
            .setSamples({
                xValues: dataArraysRef.current[LNG_COLNAME]!,
                yValues: dataArraysRef.current[LAT_COLNAME]!,
            })
            .setAreaFillStyle(emptyFill)
            .setPointFillStyle(emptyFill);
        bgSeriesRef.current = bgSeries;

        chart.forEachAxis((a) => {
            a.setIntervalRestrictions(undefined);
            a.setThickness(0);
            a.setTickStrategy(AxisTickStrategies.Empty);
            // todo: instead of this, we need logic within Leaflet.tsx
            // a.setDefaultInterval((state) => ({
            //     start: state.dataMin,
            //     end: state.dataMax,
            // }));
        });

        chart.setTitle("");
        // chart.getDefaultAxisX().setTitle("Latitude");
        chart.getDefaultAxisX().setUnits("Lng");
        // chart.getDefaultAxisY().setTitle("Longitude");
        chart.getDefaultAxisY().setUnits("Lat");

        // atm we're just using pointer-events-none on the lcjs div
        // chart.addEventListener("cursortargetchange", (event) => {
        //     const { hit } = event as CursorTargetChangedEvent<SolveResultSampleXY>;
        //     setCursor(hit ? hit.iSample : null);
        // });

        const unsub1 = subscribeLatestArrays((latest) => {
            bgSeries.appendSamples({
                xValues: latest[LNG_COLNAME]!,
                yValues: latest[LAT_COLNAME]!,
            });
            visibleSeries.appendSamples({
                xValues: latest[LNG_COLNAME]!,
                yValues: latest[LAT_COLNAME]!,
                // We default the lookup value to zero and change it in subscribeViewInterval
                lookupValues: allZeroArray.subarray(0, latest[timeColumnName]!.length + 1),
            });
        });
        const unsub2 = subscribeViewInterval(([left, right]) => {
            // console.log(left, right);

            // visibleSeries.setSamples({
            //     xValues: viewableArraysRef.current[LAT_COLNAME]!,
            //     yValues: viewableArraysRef.current[LONG_COLNAME]!,
            // });
            visibleSeries.fill({ lookupValue: 0 });

            // We need +1 as left and right from dataProvider are both inclusive
            const length = right - left + 1;
            // Generates a list of values of length `length` that are evenly
            // distributed from 0 to 1
            const gradient = Array.from({ length }, (_, i) => 0 + i / (length - 1));
            // Insert the above gradient array into the lookupValues dataset
            // channel starting at the correct index
            visibleSeries.alterSamples(left, {
                // todo: this doesn't work with data cleaning
                lookupValues: gradient,
            });
        });
        const unsub3 = subscribeReset(() => {
            bgSeries.clear();
            visibleSeries.clear();
        });

        return () => {
            unsub1();
            unsub2();
            unsub3();
            // unsub4();
            chart.dispose();
            // @ts-ignore: for GC
            chart = undefined;
            bgSeries.dispose();
            // @ts-ignore: for GC
            bgSeries = undefined;
            visibleSeries.dispose();
            // @ts-ignore: for GC
            visibleSeries = undefined;
        };
    }, [lc]);

    useEffect(() => {
        if (bgSeriesRef.current) {
            bgSeriesRef.current.setStrokeStyle(
                useBgSeries
                    ? defaultBgSeriesStrokeStyle.setThickness(trackThickness)
                    : emptyLine,
            );
        }
    }, [useBgSeries]);

    useEffect(() => {
        if (bgSeriesRef.current) {
            bgSeriesRef.current.setStrokeStyle((style) => style.setThickness(trackThickness));
        }
    }, [trackThickness]);
    useEffect(() => {
        if (visibleSeriesRef.current) {
            visibleSeriesRef.current.setStrokeStyle((style) =>
                style.setThickness(carLineThickness),
            );
        }
    }, [carLineThickness]);

    return (
        <>
            {useLeaflet ? (
                <div className="absolute w-[100%] h-[100%] z-0">
                    <Leaflet chartRef={chartRef} />
                </div>
            ) : null}
            <div
                id={id}
                ref={containerRef}
                className="absolute pointer-events-none w-[100%] h-[100%] z-40"
            ></div>
        </>
    );
}
