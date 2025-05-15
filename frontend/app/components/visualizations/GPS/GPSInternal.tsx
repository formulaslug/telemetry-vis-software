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
    PointShape,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "../lightning-charts/GlobalContext";
import globalTheme from "../lightning-charts/GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { MAX_DATA_ROWS, timeColumnName } from "@/app/data-processing/datatypes";

import dynamic from "next/dynamic";
import { GPSConfig } from "./GPS";
const Leaflet = dynamic(() => import("./Leaflet").then((o) => o), { ssr: false });

// IMPORTANT: in Leaflet, LAT is vertical (y) and LNG is horizontal (x)
const LAT_COLNAME = "VDM_GPS_Latitude"; // "GPSi_Latitude";
const LNG_COLNAME = "VDM_GPS_Longitude"; // "GPSi_Longitude";

const defaultBgSeriesStrokeStyle = new SolidLine({
    // this is just the default; its set again below
    thickness: 25,
    fillStyle: new SolidFill({ color: ColorHEX("#808080") }),
});

export default function GPSInternal({
    showLeaflet,
    showTrack,
    trackThickness,
    carLineThickness,
}: GPSConfig) {
    const {
        subscribeViewInterval,
        subscribeLatestArrays,
        subscribeCursorRow,
        subscribeReset,
        setCursor,
        dataArraysRef,
        viewableArraysRef,
        viewIntervalRef,
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
            .setCursorMode(showLeaflet ? undefined : "show-pointed")
            .setPadding(0)
            .setSeriesBackgroundFillStyle(transparentFill)
            .setSeriesBackgroundStrokeStyle(emptyLine);
        chartRef.current = chart;

        chart.engine.setBackgroundFillStyle(transparentFill);

        // The data series for the green car line
        let visibleSeries = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                dataStorage: Float32Array,
                lookupValues: true,
                // todo: enable an LUT for color based on lap #???
            })
            .setMaxSampleCount({ max: MAX_DATA_ROWS, mode: "auto" })
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
            );
        // splines aren't supported for freeform (non-progressive) data :/
        visibleSeriesRef.current = visibleSeries;

        // The data series for the low-accuracy thick gray background track
        let bgSeries = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                dataStorage: Float32Array,
            })
            .setMaxSampleCount({ max: MAX_DATA_ROWS, mode: "auto" })
            .setDrawOrder({ seriesDrawOrderIndex: 1 })
            .setSamples({
                xValues: dataArraysRef.current[LNG_COLNAME]!,
                yValues: dataArraysRef.current[LAT_COLNAME]!,
            })
            .setAreaFillStyle(emptyFill)
            .setPointFillStyle(emptyFill);
        bgSeriesRef.current = bgSeries;

        let carSeries = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                dataStorage: Float32Array,
            })
            .setMaxSampleCount(1)
            .setDrawOrder({ seriesDrawOrderIndex: 2 })
            // .setSamples({
            //     xValues: [viewableArraysRef.current[LNG_COLNAME]![viewIntervalRef.current[1] - 1]],
            //     yValues: [viewableArraysRef.current[LAT_COLNAME]![viewIntervalRef.current[1] - 1]],
            // })
            .setAreaFillStyle(emptyFill)
            .setPointFillStyle(new SolidFill({ color: ColorRGBA(0, 200, 200) }))
            .setPointShape(PointShape.Arrow)
            .setPointSize(15);

        chart.forEachAxis((a) => {
            a.setIntervalRestrictions(undefined);
            a.setThickness(0);
            a.setTickStrategy(AxisTickStrategies.Empty);
        });

        chart.setTitle("");
        chart.getDefaultAxisX().setUnits("Lng");
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
            // console.log("1", performance.now());

            // We reset and regenerate the fillStyle lookupValues each time
            // viewInterval changes. This seems to be a fairly fast operation
            visibleSeries.fill({ lookupValue: 0 });

            // console.log("2", performance.now());

            // We need +1 as left and right from dataProvider are both inclusive
            const length = right - left + 1;
            // Generates a list of values of length `length` that are evenly
            // distributed from 0.3 to 1 (0 through 0.3 is very hard to see)
            const gradient = Array.from(
                { length },
                (_, i) => 0.3 + (i / (length - 1)) * (1 - 0.3),
            );

            // console.log("3", performance.now());

            // Insert the above gradient array into the lookupValues dataset
            // channel starting at the correct index
            visibleSeries.alterSamples(left, {
                // todo: this doesn't work with data cleaning
                lookupValues: gradient,
            });

            // console.log("4", performance.now());
        });
        const unsub3 = subscribeCursorRow((cursorRow) => {
            // Always update carSeries to point to where the cursor is hovering,
            // and rotate it correctly according to GPS course. If no cursor row
            // exists, use the right-most row of viewableArrays
            const lng =
                cursorRow?.[LNG_COLNAME] ??
                dataArraysRef.current[LNG_COLNAME]?.[viewIntervalRef.current[1]] ??
                NaN;
            const lat =
                cursorRow?.[LAT_COLNAME] ??
                dataArraysRef.current[LAT_COLNAME]?.[viewIntervalRef.current[1]] ??
                NaN;
            carSeries.setSamples({
                xValues: [lng],
                yValues: [lat],
            });
            const trueCourse =
                cursorRow?.VDM_GPS_TRUE_COURSE ??
                dataArraysRef.current.VDM_GPS_TRUE_COURSE?.[viewIntervalRef.current[1]] ??
                0;
            carSeries.setPointRotation(trueCourse);
        });
        const unsub4 = subscribeReset(() => {
            bgSeries.clear();
            visibleSeries.clear();
            carSeries.clear();
        });

        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
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
            carSeries.dispose();
            // @ts-ignore: for GC
            carSeries = undefined;
        };
    }, [lc]);

    useEffect(() => {
        if (bgSeriesRef.current) {
            bgSeriesRef.current.setStrokeStyle(
                showTrack
                    ? defaultBgSeriesStrokeStyle.setThickness(trackThickness)
                    : emptyLine,
            );
        }
    }, [showTrack]);

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
            {showLeaflet ? (
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
